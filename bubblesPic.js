(function() {

var margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
    },
    width = 2000 - margin.right - margin.left,
    height = 1000 - margin.top - margin.bottom;
   // radius2 = width / 2

d3.csv("./data.csv")
    .then(function (data) {
        console.log(data);
        var svg2 = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("id", "svg2")
            .attr('transform', "translate(30, 25)")

        // parse data
        data.forEach(function (d) {
            d.time = +d.time;
        })

        window.elementData = data;
        //set up defs and pattern structure for image
        var defs = svg2.append("defs");

        defs.selectAll("images-pattern")
            .data(data)
            .enter().append("pattern")
            .attr("class", "images-pattern")
            .attr("id", function (d) {
                return d.name.replace(/ /g, "-")
            })
            .attr("height", "100%")
            .attr("width", "100%")
            .attr("patternContentUnits", "objectBoundingBox")
            .append("image")
            .attr("height", 1)
            .attr("width", 1)
            .attr("preserveAspectRatio", "none")
            .attr("xlink:href", function (d) {
                return d.image
            });

        var string = "hi";

        var row = 0;
        var cx = 25;
        var nameGroup = svg2.selectAll("circle")
            .data(window.elementData)
            .enter()
            .append("svg")
                .attr("width", width / 3)
                .attr("height", width / 10)
                .attr("id", function (d) {
                    return d.name.slice(0,4) + "-bio";
                })
                .attr("class", function(d) {
                    return d.position;
                })
                .attr("x", function (d, i) {
                    cx += width / 3;
                    if (i % 3 === 0) {
                        cx = width / 100;
                    }
                    return cx; //also placeholder for now
                })
                .attr("y", function (d, i) {
                    if (i % 3 === 0) {
                        row++;
                    }
                    return row * (width / 8) - width / 8;
                })

        //appends something for every name 
        nameGroup.append("circle")
            .attr("r", width / 20)
            .style("fill", function (d, i) {
                return "url(#" + d.name.replace(/ /g, "-") + ")"
            })
            .attr("id", function (d) {
                return d.name.slice(0,4) + "-circle";
            })
            .attr("transform", "translate(100,100)"); //placeholder

        
        nameGroup.append("text")
            .text(function(d) {
                return d.name
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "14px")
            .attr("transform", "translate(" + (width/9) + ", " + width / 80 + ")")
            .attr("id", "name");

        // nameGroup.append("rect")
        //     .attr("width", width / 5)
        //     .attr("height", width / 15)
        //     .attr("class", "shape")
        //     .attr("transform", "translate(" + (width/9) + ", " + width / 40 + ")")
        //     //.attr("fill", "white")
        //     //.attr("visibility", "hidden")
        
        // nameGroup.append("text")
        //     .attr("class", "wrap")
        //     .text(function(d) {
        //         return d.bio
        //     })
        //     .attr("font-family", "sans-serif")
        //     .attr("font-size", "14px")
        //     .attr("id", "bio")
        //     .attr("transform", "translate(" + (width/9) + ", " + width / 40 + ")");

            //.attr("transform", "translate(" + (width/9) + ", " + width / 40 + ")")
        
        
        for(person of window.elementData) {
            var abc = "#" + person.name;
            console.log("#" + person.name)
            console.log(typeof abc);
            console.log(typeof person.name);
            new d3plus.TextBox()
            .data([person])
            .fontSize(16)
            .width(400)
            // .x(225)
            // .y(25)
            .text(person.bio)
            .select("#" + person.name.slice(0,4) + "-bio")
            .render();
        };


    //console.log(d3.selectAll("#d3plus-textBox-0"))
       d3.selectAll("#d3plus-textBox-0").selectAll("*").attr("transform", "translate(" + (width/9) + ", " + width / 40 + ")")
       

    });
})();

function moveBubbles(clickedPosition, clickValue) {
    var margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
    },
    width = 2000 - margin.right - margin.left,
    height = 1000 - margin.top - margin.bottom;
    if (!clickValue) {
        var selectedPosition = clickedPosition;
        var selectedPeople = window.elementData.filter(person => person.position === selectedPosition)

        d3.select("#svg2").selectAll("svg")
            .data(window.elementData) //change data depending on what was selected
            .transition()
            .duration(1000)
            .style("opacity", (function (d) {
                if (d.position != selectedPosition) {
                    return 0;
                }
            }))

        var row = 0;
        var cx = 25;

        console.log( d3.select("#svg2").selectAll("svg").filter("." + selectedPosition))
        d3.selectAll("#svg2").selectAll("svg").filter("." + selectedPosition) //
            .data(selectedPeople)
            .transition()
            .duration(1000)
            .attr("x", function (d, i) {
                cx += width / 3;
                if (i % 3 === 0) {
                    cx = width / 100;
                }
                return cx; //also placeholder for now
            })
            .attr("y", function (d, i) {
                if (i % 3 === 0) {
                    row++;
                }
                return row * (width / 8) - width / 8;
            });

    } else {
        var row = 0;
        var cx = 25;
        console.log(d3.select("#svg2").selectAll("svg"));
        d3.selectAll("#svg2").selectAll("svg")
            .transition()
            .duration(1000)
            .style('opacity', 1)
            .attr("x", function (d, i) {
                cx += width / 3;
                if (i % 3 === 0) {
                    cx = width / 100;
                }
                return cx; //also placeholder for now
            })
            .attr("y", function (d, i) {
                if (i % 3 === 0) {
                    row++;
                }
                return row * (width / 8) - width / 8;
            });
    }
}

