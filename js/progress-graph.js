(function() {
	"use strict";

	var DATA_FILE = "data.txt";

	document.addEventListener("DOMContentLoaded", function() {
		var ctx = document.getElementById("progress-graph").getContext("2d");

		var myChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: [new Date("2015-3-15 13:3").toLocaleString(), new Date("2015-3-25 13:2").toLocaleString(), new Date("2015-4-25 14:12").toLocaleString()],
				datasets: [{
					label: 'Demo',
					data: [{
						t: new Date("2018-04-08 18:23:22"),
						y: .57720
					},
					{
						t: new Date("2018-04-09 16:56:33"),
						y: .57720
					},
					{
						t: new Date("2018-04-09 19:00:53 -0700"),
						y: .57720
					},
					{
						t: new Date("2018-04-26 15:15:34"),
						y: .76178
					},
					{
						t: new Date("2018-04-26 15:21:05 -0700"),
						y: .76178
					}
					],
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
	});

	function getFiles() {
        var ajax = new XMLHttpRequest();
        ajax.onload = loadFiles;
        ajax.open("GET", DATA_FILE, true);
        ajax.withCredentials = true;
        ajax.send();
    }

    function loadFiles() {
        if (this.readyState === 4 && this.status === 200) {
            showError("");
            var files = this.responseText.match(/[^\r\n]+/g);

            for (var i = 0; i < files.length; i++) {
                
            }
            fixSize();
        } else {
            alert("There was a problem getting the contents of " + DATA_FILE);
        }
    }
}) ();