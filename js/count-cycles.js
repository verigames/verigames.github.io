var window = self;

self.importScripts("https://cdnjs.cloudflare.com/ajax/libs/mathjs/4.2.2/math.min.js");

self.addEventListener("message", function(e) {
	var message = JSON.parse(e.data);

	var adjMat = message.adjMat;
    var cycle3AdjMat = math.multiply(adjMat, math.multiply(adjMat, adjMat));

    // Count number of 3-cycles
    var cycle3Count = 0;
    for (var i = 0; i < message.moduleCount; i++) {
        cycle3Count += cycle3AdjMat[i][i];
    }

	self.postMessage(cycle3Count);
}, false);