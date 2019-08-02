(function() {

var n = 10, // number of samples (columns)
  m = 5; // number of series (layers)

var data = d3.range(n).map(function () {
  return d3.range(m).map(Math.random);
});

var margin = {
    top: 20,
    right: 30,
    bottom: 30,
    left: 40
  },
  width = 960 - margin.left - margin.right,
  height = 510 - margin.top - margin.bottom;

var y = d3.scaleLinear()
  .rangeRound([height, 0])
  .nice();

var x = d3.scaleBand()
  .rangeRound([0, width])
  .paddingInner(0.05)
  .align(0.1)

var z = d3.scaleOrdinal(d3.schemeCategory10)

// Date format https://bl.ocks.org/zanarmstrong/ca0adb7e426c12c06a95
var parseTime = d3.timeParse("%b %Y")


// Load stocks data
// Ex: 0: {symbol: "MSFT", date: "Jan 2000", price: "39.81"}
d3.csv('rawdata.txt')
  .then(function (raw) {

    window.elementRaw = raw;

    var numberOfBars = raw.filter(something => something.symbol === "PI").length;
    window.numberBars = numberOfBars;

    var symbols = [];
    var data = []


    // Data pre-processing
    raw.forEach(function (d, i) {

      // If d.symbol doesn't exist in the array of symbols, put it in the array and create an array at that index in the data[] array
      if (symbols.indexOf(d.symbol) < 0) {
        symbols.push(d.symbol)
        data[symbols.indexOf(d.symbol)] = [];
      }
      // String to INT
      d.value = +d.price;

      // Parsing time
      d.date = parseTime(d.date)
      data[symbols.indexOf(d.symbol)].push(d);
    });

    // getMonth returns integer of month, not a string
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    var data_nest = d3.nest()
      .key(function (d) {
        return monthNames[(d.date.getMonth())] + " " + d.date.getFullYear();
      })
      .key(function (d) {
        return d.symbol;
      })
      .rollup(function (v) {
        return d3.sum(v, function (d) {
          return d.price;
        });
      })
      .entries(raw);

    console.log(data_nest);
    var years = data_nest.map(function (d) {
      //console.log(d.key);
      console.log(d);
      return d.key;
    })

    var data_stack = []

    data_nest.forEach(function (d, i) {
      d.values = d.values.map(function (e) {
        return e.value;
      })
      var t = {}
      symbols.forEach(function (e, i) {
        t[e] = d.values[i]
      })
      t.year = d.key;
      data_stack.push(t)
    })


    var layers = d3.stack().keys(symbols)(data_stack);

    var max = d3.max(layers[layers.length - 1], function (d) {
      return d[1];
    });

    y.domain([0, max]);
    x.domain(years);


    var svg = d3.select("body").append("svg")
      .attr("class", "chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var counter = -1;

    svg.append("g").selectAll("g")
      .data(layers)
      .enter().append("g")
      .style("fill", function (d, i) {
        return z(i);
      })
      .attr("id", function (d, i) {
        return (window.elementRaw[i * window.numberBars].symbol);
      })
      .selectAll("rect")
      .data(function (d) {
        return d;
      })
      .enter().append("rect")
      .attr("x", function (d, i) {
        return x(d.data.year);
      })
      .attr("id", function (d, i) {
        counter++;
        return (window.elementRaw[counter].symbol);
      })
      .attr("y", function (d) {
        return y(d[1]);
      })
      .attr("height", function (d) {
        return y(d[0]) - y(d[1]);
      })
      .attr("width", x.bandwidth())
      .transition()
      //.attr("y", height)
      .style("opacity", 1)
      .duration(100);

    var rects = svg.selectAll("g").selectAll("rect");

    var clicked = false;

    var mouseClick = function () {
      let x = 0;
      // calculates which row of rectangles we are working with
      for (let i = 0; i < rects.nodes().length / 2; i++) {
        if (this === rects.nodes()[i]) {
          // MAYBE HARDCODED
          x = Math.floor(i /  window.numberBars) * window.numberBars;
        }
      }
      // moves the face bubbles
      moveBubbles(d3.select(this).attr("id"), clicked);

      if (!clicked) {
        rects.transition()
          .style("opacity", 0)
          .duration(1000)
          .attr("y", height);
        // loops through all rectangles of the same category
        // data[0].length is the number of rectangles in each category
        for (let i = 0; i < data[0].length; i++) {

          d3.select(rects.nodes()[x + i]).style("opacity", 1)
            .transition()
            .style("opacity", 1)
            .duration(1000);
          // calculates y coordinate transition for different block height
          // for some reason need parseInt or else some values don't evaluate as a number correctly
          // check if > the first rectangle in the node array (should always be base height of 1 person, as it is the PI position)
          if (parseInt(d3.select(rects.nodes()[x + i]).attr("height")) > parseInt(d3.select(rects.nodes()[1]).attr("height"))) {
            let adjust = Math.round(d3.select(rects.nodes()[x + i]).attr("height"));
            d3.select(rects.nodes()[x + i]).style("opacity", 1)
              .transition()
              .attr("y", height - adjust)
              .ease(d3.easeBounce)
              .delay(250)
              .duration(1000);
          } else {
            d3.select(rects.nodes()[x + i]).style("opacity", 1)
              .transition()
              .ease(d3.easeBounce)
              .attr("y", height - (d3.select(rects.nodes()[1]).attr("height")))
              .delay(250)
              .duration(1000);
          }

        }
        clicked = true;
      } else {
        rects.transition()
          .attr("y", function (d) {
            return y(d[1]);
          })
          .style("opacity", 1)
          .ease(d3.easeBack)
          .duration(750);
        clicked = false;
      }
    };

    var tipMouseout = function () {
      rects.transition()
        .attr("y", function (d) {
          return y(d[1]);
        })
        .style("opacity", 1)
        .duration(1000)
    };
    var tipMouseover = function () {
      rects.transition()
        .attr("y", height)
        .style("opacity", 0)
        .duration(1000)
    };


    rects.on("click", mouseClick);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
      // .on("mouseover", tipMouseover)
      // .on("mouseout", tipMouseout);

    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + (0) + ", 0)")
      .call(d3.axisLeft().scale(y))


    var legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(' + 15 + ', 0)');

    legend.selectAll('rect')
      .data(symbols)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', function (d, i) {
        return i * 18;
      })
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', function (d, i) {
        return z(i);
      });

    legend.selectAll('text')
      .data(symbols)
      .enter()
      .append('text')
      .text(function (d) {
        return d.replace(/-/g, ' ');
      })
      .attr('x', 18)
      .attr('y', function (d, i) {
        return i * 18;
      })
      .attr('text-anchor', 'start')
      .attr('alignment-baseline', 'hanging');

  })

  .catch(function (error) {
    console.log('error');
  })

})();