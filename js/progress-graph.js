(function() {
	"use strict";

	var DATA_FILE = "data.txt";

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

    function loadData() {
        if (this.readyState === 4 && this.status === 200) {
            var files = this.responseText.match(/[^\r\n]+/g);

            var dates = [];
            var values = [];
            for (var i = 0; i < files.length; i++) {
                console.log(files[i]);
                var parts = files[i].split("=");
				var date = files[0];
				var value = files[1];

				dates.push(date);
				values.push(value);
            }
            makeGraph(dates, values);
        } else {
            alert("There was a problem getting the contents of " + DATA_FILE);
        }
    }

    function makeGraph(dates, values) {
    	var ctx = document.getElementById("progress-graph").getContext("2d");

    	var labelStrings = [];
    	for(var i = 0; i < dates.length; i++) {
    		labelStrings.push(new Date(dates[i]).toLocaleString());
    	}

    	var dataPoints = [];
    	for(var i = 0; i < dates.length; i++) {
    		var point = {
    			t: new Date(dates[i]),
    			y: values[i]
    		};
    		dataPoints.push(point);
    	}

		var chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: labelStrings,
				datasets: [{
					label: 'Progress',
					data: dataPoints,
					backgroundColor: [
					'rgba(255, 99, 132, 0.2)',
					'rgba(54, 162, 235, 0.2)',
					'rgba(255, 206, 86, 0.2)',
					'rgba(75, 192, 192, 0.2)',
					'rgba(153, 102, 255, 0.2)',
					'rgba(255, 159, 64, 0.2)'
					],
					borderColor: [
					'rgba(255,99,132,1)',
					'rgba(54, 162, 235, 1)',
					'rgba(255, 206, 86, 1)',
					'rgba(75, 192, 192, 1)',
					'rgba(153, 102, 255, 1)',
					'rgba(255, 159, 64, 1)'
					],
					borderWidth: 1
				}]
			}
		});
    }
}) ();