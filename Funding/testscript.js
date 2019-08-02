d3.csv("funding.csv").then(function (data) {

    // data.sort(function (a, b) {
    //     return b.duration < a.start;
    // })

    //THIS IS A TEST

    data.forEach(function(d) {
        d.duration = +d.duration;
        d.amount = +d.amount;

        var startDate = d.start

        var year = parseInt(startDate.slice(0,4));
        var month = parseInt(startDate.slice(4, 6));
        var day = parseInt(startDate.slice(6, 8));

        d.start = year + (month / 12) + (day / 365) - (1 / 12) - (1 / 365);
    });

    var importedGrants = data.sort(function (a, b) {
        return b.duration >= a.duration;
    })

    var labGrants = importedGrants.filter(grant => grant.type === "Lab")
    // var personalGrants = importedGrants.filter(grant => grant.type === "Student")

    var yearRange = function (grants) {
        var years = [];
        for (grant of grants) {
            years.push(grant.start);
        }
        return years;
    }(data).filter(function onlyUnique(value, index, self) { 
        return self.indexOf(value) === index;
    });

    var minYear = Math.floor(d3.min(yearRange));
    var maxYear = Math.floor(d3.max(yearRange)) + 1;

    console.log(labGrants[0])
    var maxDurationEnd = Math.floor(getGrantBounds(labGrants[0]).end);

    if(maxDurationEnd > maxYear) {
        maxYear = maxDurationEnd + 1;
    }

    maxYear = 2025;

    var width = 1000;
    var height = 1000;

    var widthScale = d3.scaleLinear()
        .domain([minYear, maxYear])
        .range([0, width * 0.8]);
        
    var axis = d3.axisBottom()
        .scale(widthScale)
        .ticks(yearRange.length + 1)
        .tickFormat(d3.format("d"));

    var canvas = d3.selectAll("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(20,0)");

    var chartBody = canvas.append("g")
        .attr("transform", "translate(100)")
        .attr("width", width)
        .attr("height", 500);

    var placedBarPositions = []
    for(grant of labGrants) {
        placedBarPositions.push([])
    }

    var labBars = chartBody.selectAll("rect")
        .data(labGrants)
        .enter()
        .append("rect")
        .attr("width", function (d) {
            var startDate = d.start;
            var duration = d.duration;

            var scaledStartPosition = widthScale(startDate);
            var scaledEndPosition = widthScale(startDate + (duration / 12));

            return scaledEndPosition - scaledStartPosition;
        })
        .attr("height", 30)
        .attr("x", -500)
        .attr("y", function (d, i) {

            //prob not the cleanest, see if anything else can be done
            for (var i = 0; i < placedBarPositions.length; i++) {

                if (placedBarPositions[i].length === 0) {
                    placedBarPositions[i].push(d)
                    console.log(d.start + " placed in row " + i);
                    return 50 + (50 * i)
                }

                for (var j = 0; j < placedBarPositions[i].length; j++) {
                    var currentGrant = placedBarPositions[i][j];
                    var nextGrant = placedBarPositions[i][j + 1];

                    if (!checkOverlap(d, currentGrant) && (nextGrant === undefined || !checkOverlap(d, nextGrant))) {
                        //if there is an open spot, place the bar
                        console.log(d.start + " placed in row " + i);
                        placedBarPositions[i].push(d);
                        return 50 + (50 * i)
                    } else {
                        break;
                    }
                }
            }

        })
        .attr("id", "labBars")
        .attr("rx", 8)
        .attr("ry", 8)
        .attr("fill", function (d, i) {
            var number = Math.random();
            number = number < 0.2 ? number + 0.2 : number;

            return d3.interpolatePuBu(number);
        })
        .attr("visibility", "hidden");

    d3.selectAll("#labBars")
        .data(labGrants)
        .transition()
        .duration(1000)
        .attr("x", function (d, i) {
            var startDate = d.start;
            return widthScale(startDate);
        })
        .attr("visibility", "visible");

    
    var emptyArray = []
    var numberOfOccupiedRows = placedBarPositions.length - placedBarPositions.filter(function(a) {return a.length === 0}).length
        
    var axis =  canvas.append("g")
        .attr("transform", function(d, i) {
            var value = "translate(100,"
            var yValue = (numberOfOccupiedRows + 1) * 50;
            value += yValue + ")"
            console.log(value)
            return value; 
        })
        .attr("class", "axis")
        .call(axis);


});


function getGrantBounds(grant) {
    var startPositionValue = grant.start;
    var duration = grant.duration;

    var endPositionValue = startPositionValue + (duration / 12);
    return {
        start: startPositionValue,
        end: endPositionValue
    };
}

function checkOverlap(grant1, grant2) {
    var g1 = getGrantBounds(grant1);
    var g2 = getGrantBounds(grant2);

    console.log("comparing " + grant1.start + " vs " + grant2.start);
    if (g1.start <= g2.start) {
        if (g1.end >= g2.start) {
            console.log("overlap1")
            return true;
        }
    } else if (g1.start >= g2.start) {
        if (g1.start <= g2.end) {
            console.log("overlap2")
            return true;
        } 
    }
    return false;
}

Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};