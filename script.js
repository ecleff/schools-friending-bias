// // https://gramener.github.io/d3js-playbook/transitions.html

// import {Legend, Swatches} from "@d3/color-legend"
// const legend = Legend(d3.scaleSequential([0, 2], d3.interpolateMagma), {
//   title: "Exposure"
// })

// set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 30, left: 60 },
  width = 860 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);
//Read the data
d3.csv("sc_schools_data.csv").then(function (data) {
  data.forEach(function (d) {
    d["perwht"] = +d["perwht"] * 100;
    d["perblk"] = +d["perblk"] * 100;
    d["pernam"] = +d["pernam"] * 100;
    d["perhsp"] = +d["perhsp"] * 100;
    d["perasn"] = +d["perasn"] * 100;
    d["perfrl"] = +d["perfrl"] * 100;
    d["perell"] = +d["perell"] * 100;
    d["bias_own_ses_hs"] = +d["bias_own_ses_hs"] * 100;
    d["totenrl"] = +d["totenrl"];
    d["ec_own_ses_hs"] = +d["ec_own_ses_hs"];
    d["exposure_own_ses_hs"] = +d["exposure_own_ses_hs"];
  });
  // Add X axis
  const x = d3.scaleLinear().domain([0, 100]).range([0, width]);
  const xAxis = svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  // Add Y axis
  const y = d3.scaleLinear().domain([-40, 40]).range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  // color scheme - Exposure
  let sequentialScale = d3
    .scaleSequential()
    .domain([0, 2])
    .interpolator(d3.interpolateMagma);


  // Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
  // Its opacity is set to 0: we don't see it by default.
  const tooltip = d3
    .select("#my_dataviz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px");

  // A function that change this tooltip when the user hover a point.
  // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
  const mouseover = function (event, d) {
    tooltip.style("opacity", 1);
  };

  const mousemove = function (event, d) {
    tooltip
      .html(
        `Low-income students at this school have a ${d.bias_own_ses_hs}% likelihood of forming friendships with the high-income students they are exposed to (School NCES ID: ${d.ncessch}). `
      )
      .style("left", event.x / 2 + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style("top", event.y / 2 + "px");
  };

  // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
  const mouseleave = function (event, d) {
    tooltip.transition().duration(200).style("opacity", 0);
  };

  // Add dots
  svg
    .append("g")
    .selectAll("dot")
    .data(data)
    .join("circle")
    .attr("cx", function (d) {
      return x(d.perwht);
    })
    .attr("cy", function (d) {
      return y(d.bias_own_ses_hs);
    })
    .attr("r", 7)
    .attr("opacity", "0.7")
    .style("fill", function (d) {
      return sequentialScale(d.exposure_own_ses_hs);
    })
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);

  // Y axis label

  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", -margin.top)
    .text("Friending bias (%)");
  // X axis label
  svg
    .append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 6)
    .text("White student population (%)");

  // A function that update the plot for a given xlim value
  function updatePlot() {
    // Get the value of the button
    xlim = this.value;

    // Update X axis
    x.domain([0, xlim]);
    xAxis.transition().duration(1000).call(d3.axisBottom(x));

    // Update chart
    svg
      .selectAll("circle")
      .data(data)
      .transition()
      .duration(1000)
      .attr("cx", function (d) {
        return x(d.perwht);
      })
      .attr("cy", function (d) {
        return y(d.bias_own_ses_hs);
      });
  }

  // Add an event listener to the button created in the html part
  d3.select("#buttonXlim").on("input", updatePlot);

  // A function that create / update the plot for a given variable:
  // update function
  function updateDataWhite() {
    // code should go here to select all the circles
    // and then update them using a transition
    d3.selectAll("dots")
      .data(data)
      .join("circle")
      .transition()
      .duration(2000)
      .attr("cx", function (d) {
        return x(d.perwht);
      })
      .style("fill", "#BEA7E5");
    // Update chart
    svg
      .selectAll("circle")
      .data(data)
      .transition()
      .duration(1000)
      .attr("cx", function (d) {
        return x(d.perwht);
      })
      .attr("cy", function (d) {
        return y(d.bias_own_ses_hs);
      });

    //  add a white rectangle beneath the new x-axis label - this way, as you click more buttons, the text won't overlap on top of one another
    svg
      .append("rect")
      .attr("x", 20)
      .attr("y", height - 22)
      .attr("width", width)
      .attr("height", 20)
      .style("fill", "white");

    // add new x axis label
    svg
      .append("text")
      .transition()
      .duration(1000)
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height - 6)
      .text("White student population (%)");
  }
  d3.select("#updateButtonWhite").on("click", updateDataWhite);

  // update function for Percent Asian
  function updateDataAsn() {
    // code should go here to select all the circles
    // and then update them using a transition
    d3.selectAll("dots")
      .data(data)
      .join("circle")
      .transition()
      .duration(2000)
      .attr("cx", function (d) {
        return x(d.perasn);
      })
      .style("fill", "#BEA7E5");
    // Update chart
    svg
      .selectAll("circle")
      .data(data)
      .transition()
      .duration(1000)
      .attr("cx", function (d) {
        return x(d.perasn);
      })
      .attr("cy", function (d) {
        return y(d.bias_own_ses_hs);
      });

    svg
      .append("rect")
      .attr("x", 20)
      .attr("y", height - 22)
      .attr("width", width)
      .attr("height", 20)
      .style("fill", "white");

    svg
      .append("text")
      .transition()
      .duration(1000)
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height - 6)
      .text("Asian student population (%)");
  }
  d3.select("#updateButtonAsn").on("click", updateDataAsn);

  // update function for Percent Black
  function updateDataBlk() {
    d3.selectAll("dots")
      .data(data)
      .join("circle")
      .transition()
      .duration(2000)
      .attr("cx", function (d) {
        return x(d.perblk);
      })
      .style("fill", "red");
    // Update chart
    svg
      .selectAll("circle")
      .data(data)
      .transition()
      .duration(1000)
      .attr("cx", function (d) {
        return x(d.perblk);
      })
      .attr("cy", function (d) {
        return y(d.bias_own_ses_hs);
      });

    svg
      .append("rect")
      .attr("x", 20)
      .attr("y", height - 22)
      .attr("width", width)
      .attr("height", 20)
      .style("fill", "white");

    svg
      .append("text")
      .transition()
      .duration(1000)
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height - 6)
      .text("Black student population (%)");
  }
  d3.select("#updateButtonBlk").on("click", updateDataBlk);

  // update function for Percent Hispanic
  function updateDataHsp() {
    d3.selectAll("dots")
      .data(data)
      .join("circle")
      .transition()
      .duration(2000)
      .attr("cx", function (d) {
        return x(d.perhsp);
      })
      .style("fill", "blue");
    // Update chart
    svg
      .selectAll("circle")
      .data(data)
      .transition()
      .duration(1000)
      .attr("cx", function (d) {
        return x(d.perhsp);
      })
      .attr("cy", function (d) {
        return y(d.bias_own_ses_hs);
      });

    svg
      .append("rect")
      .attr("x", 20)
      .attr("y", height - 22)
      .attr("width", width)
      .attr("height", 20)
      .style("fill", "white");

    svg
      .append("text")
      .transition()
      .duration(1000)
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height - 6)
      .text("Hispanic student population (%)");
  }
  d3.select("#updateButtonHsp").on("click", updateDataHsp);

  // update function for Percent Native American/Pacific Islander
  function updateDataNam() {
    d3.selectAll("dots")
      .data(data)
      .join("circle")
      .transition()
      .duration(2000)
      .attr("cx", function (d) {
        return x(d.pernam);
      })
      .style("fill", "blue");
    // Update chart
    svg
      .selectAll("circle")
      .data(data)
      .transition()
      .duration(1000)
      .attr("cx", function (d) {
        return x(d.pernam);
      })
      .attr("cy", function (d) {
        return y(d.bias_own_ses_hs);
      });

    svg
      .append("rect")
      .attr("x", 20)
      .attr("y", height - 22)
      .attr("width", width)
      .attr("height", 20)
      .style("fill", "white");

    svg
      .append("text")
      .transition()
      .duration(1000)
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height - 6)
      .text("Native American/Pacific Islander student population (%)");
  }
  d3.select("#updateButtonNam").on("click", updateDataNam);

  // update function for Percent on Free/Reduced lunch
  function updateDataFrl() {
    d3.selectAll("dots")
      .data(data)
      .join("circle")
      .transition()
      .duration(2000)
      .attr("cx", function (d) {
        return x(d.perfrl);
      })
      .style("fill", "blue");
    // Update chart
    svg
      .selectAll("circle")
      .data(data)
      .transition()
      .duration(1000)
      .attr("cx", function (d) {
        return x(d.perfrl);
      })
      .attr("cy", function (d) {
        return y(d.bias_own_ses_hs);
      });

    svg
      .append("rect")
      .attr("x", 20)
      .attr("y", height - 22)
      .attr("width", width)
      .attr("height", 20)
      .style("fill", "white");

    svg
      .append("text")
      .transition()
      .duration(1000)
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height - 6)
      .text("Free/Reduced Lunch student population (%)");
  }
  d3.select("#updateButtonFrl").on("click", updateDataFrl);
});


