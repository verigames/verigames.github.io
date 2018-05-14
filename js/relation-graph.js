(function() {
	"use strict";

	var DATA_FILE = "/fj_relation_data.txt";

	document.addEventListener("DOMContentLoaded", function() {
		getData();
	});

	function getData() {
		var ajax = new XMLHttpRequest();
		ajax.onload = loadData;
		ajax.open("GET", DATA_FILE, true);
		ajax.withCredentials = true;
		ajax.send();
	}

    // Simple seeded random number generator
    var seed = 1;
    function srand() {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

	function loadData() {
		if (this.readyState === 4 && this.status === 200) {
			var data = this.responseText.match(/[^\r\n]+/g);

            // Graph data
            var g = {
                nodes: [],
                edges: []
            };
            // Graph stats
            var avgOutdegree = 0;
            var maxOutdegree = 0;
            var maxOutdegreeModule = "N/A";

            // Adjacency matrix raw data array
            var adjMatArr = [];
            var moduleIndex = {};
            // Add all nodes to the graph
            var modules = data[0].split(" ");
            for (var i = 0; i < modules.length; i++) {
                if (modules[i] === "") {
                    continue;
                }

                // Initialize a row of 0's
                var n = [];
                for (var j = 0; j < modules.length - 1; j++) {
                    n.push(0);
                }
                adjMatArr.push(n);

                var parts = modules[i].split(":");
                var moduleName = parts[0];
                var moduleLines = parts[1];
                moduleIndex[moduleName] = i; // Assign each module an index

                g.nodes.push({
                    id: moduleName,
                    label: moduleName,
                    x: srand(),
                    y: srand(),
                    // Min to prevent too extreme size distribution
                    size: Math.min(moduleLines, 1500), 
                    color: "#148"
                });
            }

            // Add all edges to the graph
            var outdegrees = {}
			for (var i = 1; i < data.length; i++) {
                var parts = data[i].split(" ");
                var module = parts[0];

                outdegrees[module] = parts.length - 1;
                // Update stats
                if (parts.length - 1 > maxOutdegree) {
                    maxOutdegree = parts.length - 1;
                    maxOutdegreeModule = module;
                }
                avgOutdegree += parts.length - 1;

                for (var j = 1; j < parts.length; j++) {
                    if (modules[j] === "") {
                        continue;
                    }

                    adjMatArr[moduleIndex[module]][moduleIndex[parts[j]]] = 1
                    g.edges.push({
                        id: module + "-" + parts[j],
                        source: module,
                        target: parts[j],
                        size: 1,
                        color: "#ccd",
                        type: "arrow",
                    });
                }
            }
            avgOutdegree /= modules.length - 1;

            // // Update labels with outdegrees
            // s.graph.nodes().forEach(function(n) {
            //     n.label = "a";
            // });
            for(var i = 0; i < g.nodes.length; i++) {
                g.nodes[i].label += ":" + outdegrees[g.nodes[i].label];
            }

            // Create worker to calculate cycles, so as to not freeze the rest
            // of the window while working
            var cycleWorker = new Worker("/js/count-cycles.js");
            cycleWorker.addEventListener("message", function(e) {
                document.getElementById("cycle3-count").innerHTML = e.data;
            });
            var message = {
                adjMat: adjMatArr,
                moduleCount: modules.length - 1
            }
            cycleWorker.postMessage(JSON.stringify(message));

            document.getElementById("module-count").innerHTML = modules.length - 1;
            document.getElementById("avg-outdegree").innerHTML = Math.round(avgOutdegree * 100) / 100.0;
            document.getElementById("max-outdegree").innerHTML = maxOutdegree + " (" + maxOutdegreeModule + ")";

            // Add a method to the graph model that returns an
            // object with every neighbors of a node inside:
            sigma.classes.graph.addMethod("neighbors", function(nodeId) {
                var k,
                neighbors = {},
                index = this.allNeighborsIndex[nodeId] || {};

                for (k in index) {
                    neighbors[k] = this.nodesIndex[k];
                }

                return neighbors;
            });
            // Moves an edge to be rendered on top of all others
            sigma.classes.graph.addMethod("moveEdgeToTop", function(e) {
                var idx = this.edgesArray.indexOf(e);
                this.edgesArray.splice(idx, 1);
                this.edgesArray.push(e);
            });

            // Create graph display
            var s = new sigma({
                graph: g,
                container: "relation-graph"
            });


            // Save original colors
            s.graph.nodes().forEach(function(n) {
                n.originalColor = n.color;
                // n.highlighted = false;
            });
            s.graph.edges().forEach(function(e) {
                e.originalColor = e.color;
            });

            // When a node is clicked, we check for each node
            // if it is a neighbor of the clicked one. If not,
            // we set its color as grey, and else, it takes its
            // original color.
            // We do the same for the edges, and we only keep
            // edges that have both extremities colored.
            s.bind("overNode", function(e) {
                // If this node is already highlighted, unhighlight everything
                // if (e.data.node.highlighted) {
                //     e.data.node.highlighted = false;

                //     s.graph.nodes().forEach(function(n) {
                //         n.color = n.originalColor;
                //     });
                //     s.graph.edges().forEach(function(e) {
                //         e.color = e.originalColor;
                //     });

                //     s.refresh();
                //     return;
                // }

                var nodeId = e.data.node.id,
                toKeep = s.graph.neighbors(nodeId);
                toKeep[nodeId] = e.data.node;

                s.graph.nodes().forEach(function(n) {
                    // n.highlighted = false;
                    if (toKeep[n.id]) {
                        n.color = n.originalColor;
                    } else {
                        n.color = "#eee";
                    }
                });

                s.graph.edges().forEach(function(e) {
                    if (e.source === nodeId && toKeep[e.target]) {
                        e.color = e.originalColor;

                        s.graph.moveEdgeToTop(e);
                    } else {
                        e.color = "#eee";
                    }
                });

                // e.data.node.highlighted = true;
                s.refresh();
            });
            // Unhighlight everything when no longer hovering
            s.bind("outNode", function(e) {
                // e.data.node.highlighted = false;

                s.graph.nodes().forEach(function(n) {
                    n.color = n.originalColor;
                });
                s.graph.edges().forEach(function(e) {
                    e.color = e.originalColor;
                });

                s.refresh();
            });

            // Enable dragging
            var dragListener = sigma.plugins.dragNodes(s, s.renderers[0]);

            // Adjust layout
            s.startForceAtlas2({
                worker: true,
                edgeWeightInfluence: 1,
                scalingRatio: 0.01,
                startingIterations: 30,
            });
            setTimeout(function() {
                s.stopForceAtlas2();
            }, 3000);
        } else {
        	alert("There was a problem getting the contents of " + DATA_FILE);
        }
    }
}) ();