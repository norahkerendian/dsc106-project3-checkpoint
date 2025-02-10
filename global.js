// function main(){
//     var filePath="./data/data.csv";
//     plot(filePath);
// }

// var plot=function(filePath){
//     d3.csv(filePath).then(function(data){
//         // data preparation
//         console.log(data);
//         let furniture = data.filter(d => d.Category == "Furniture");
//         let after2016 = furniture.filter(d => d["Order Date"].split('/')[2] >= 2017);
//         let states = new Set();
//         after2016.forEach(d => states.add(d['State']));
//         let sortedStates = Array.from(states).sort();
//         let sales = Object.fromEntries(d3.rollup(after2016, v => d3.sum(v, d => d['Sales']), d => d.State));
//         let profit = Object.fromEntries(d3.rollup(after2016, v => d3.sum(v, d => d['Profit']), d => d.State));
//         let after2016Data = [];
//         sortedStates.forEach(d => after2016Data.push({'state': d, 'totalSales': sales[d], 'totalProfit': profit[d]}));
//         console.log(after2016);

//         let width = 1000;
//         let height = 700;
//         let margin = 60;
//         let topAdjustment = 5000;
//         let keys = ['totalSales', 'totalProfit'];
        
//         // defining the axes
//         var xScale = d3.scaleBand().domain(sortedStates).range([margin, width-margin]);
//         var yScale = d3.scaleLinear().domain([0, d3.max(after2016Data, d => d.totalSales) + topAdjustment]).range([height - margin, margin]); // why is this range inverted
//         var colorScale = d3.scaleOrdinal().domain(keys).range(d3.schemeSet3);

//         // drawing the axes
//         let svg = d3.select("#demo_plot").append("svg").attr("height", height).attr("width", width);
//         svg.append("g").attr("transform", "translate(0," + `${height - margin}` + ")").call(d3.axisBottom(xScale)).selectAll("text").style("text-anchor", "end").attr("transform", "rotate(-30)");
//         svg.append("g").attr("transform", "translate(" + margin + ", 0)").call(d3.axisLeft(yScale));

//         // // drawing the plot using our data
//         var stacked = d3.stack().keys(keys)(after2016Data);
//         svg.selectAll(".paths").data(stacked).enter().append("path")
//             .attr("d", d3.area().x(
//                     d => xScale(d.data.state) + xScale.bandwidth() / 2
//                 ).y0(
//                     d => yScale(d[0])
//                 ).y1(
//                     d => yScale(d[1])
//                 )
//             )
//             .style("fill", (d) => colorScale(d.key));
        
//         // adding appropriate labels and decorations
//         svg.append("text").attr("x", width-margin/2).attr("y", height-margin/2).style("text-anchor", "middle").text("States");
//         svg.append("text").attr("x", margin).attr("y", margin/2).style("text-anchor", "middle").text("Sales/Profits");
//         svg.append("circle").attr("cx", width-margin * 2).attr("cy", margin).attr("r", 6).style("fill", d3.schemeSet3[0]);
//         svg.append("circle").attr("cx", width-margin * 2).attr("cy", margin*2).attr("r", 6).style("fill", d3.schemeSet3[1]);
//         svg.append("text").attr("x", width-margin*1.5).attr("y", margin + 5).text("Sales");
//         svg.append("text").attr("x", width-margin*1.5).attr("y", margin*2 + 5).text("Profit");
//         svg.append("text").attr("x", width / 4).attr("y", margin).text("U.S. States' Total E-Commerce Sales & Profit After 2016").attr("font-size", 25);
//     });

// }

d3.json("dengue_cases.json").then(function(data) {
    // Set up SVG dimensions
    const margin = {top: 40, right: 100, bottom: 50, left: 60};
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Parse data
    const municipalities = d3.groups(data, d => d.Municipality);
    
    // Scales
    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Year))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Cases)])
        .nice()
        .range([height, 0]);

    const color = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(municipalities.map(d => d[0]));

    // Line generator
    const line = d3.line()
        .x(d => x(d.Year))
        .y(d => y(d.Cases));

    // Draw lines for each municipality
    svg.selectAll(".line")
        .data(municipalities)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", d => color(d[0]))
        .attr("stroke-width", 2)
        .attr("d", d => line(d[1]));

    // X-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // Y-axis
    svg.append("g").call(d3.axisLeft(y));

    // Legend inside the scrollable container
    const legendSvg = d3.select("#legend-svg")
        .attr("height", municipalities.length * 20); // Adjust dynamically

    const legend = legendSvg.append("g")
        .attr("transform", `translate(10,10)`);

    municipalities.forEach((d, i) => {
        legend.append("circle")
            .attr("cx", 10)
            .attr("cy", i * 20)
            .attr("r", 5)
            .style("fill", color(d[0]));

        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 5)
            .text(d[0])
            .style("font-size", "12px")
            .attr("alignment-baseline", "middle");
    });

});
