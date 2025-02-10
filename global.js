// function example() {
// 	return Promise.resolve(1)
// 	.then(() => {
// 		return Promise.resolve(2);
// 	}).then((value) => {
// 		console.log(value);
// 		return Promise.reject(3);
// 	}).catch((error) => {
// 		console.log(error);
// 	})
// }

// async function example() {
// 	try {
// 		await Promise.resolve(1);
// 		let value = await Promise.resolve(2);
// 		console.log(value);
// 		return Promise.reject(3);
// 	} catch (error) {
// 		console.log(error);
// 	}
// }

// async function fetchData(id) {
//   return new Promise(resolve => 
//     setTimeout(
// 	  () => resolve(`Data for ${id}`), 
// 	  Math.random() * 2000 // Random delay
//     )
//   );
// }

// async function processUnexpectedOrder() {

//   const promises = [1, 2, 3, 4, 5].map(i => fetchData(i));
//   const results = await Promise.all(promises);

//   console.log("Final Results:", results);
// }

// processUnexpectedOrder();

// async function one() {
// 	await Promise.resolve(1);
// }

// function two() {
// 	await one();
// }

// function three() {
// 	two();
// }

function main(){
    var filePath="./data/data.csv";
    plot(filePath);
}

var plot=function(filePath){
    d3.csv(filePath).then(function(data){
        // data preparation
        console.log(data);
        let furniture = data.filter(d => d.Category == "Furniture");
        let after2016 = furniture.filter(d => d["Order Date"].split('/')[2] >= 2017);
        let states = new Set();
        after2016.forEach(d => states.add(d['State']));
        let sortedStates = Array.from(states).sort();
        let sales = Object.fromEntries(d3.rollup(after2016, v => d3.sum(v, d => d['Sales']), d => d.State));
        let profit = Object.fromEntries(d3.rollup(after2016, v => d3.sum(v, d => d['Profit']), d => d.State));
        let after2016Data = [];
        sortedStates.forEach(d => after2016Data.push({'state': d, 'totalSales': sales[d], 'totalProfit': profit[d]}));
        console.log(after2016);

        let width = 1000;
        let height = 700;
        let margin = 60;
        let topAdjustment = 5000;
        let keys = ['totalSales', 'totalProfit'];
        
        // defining the axes
        var xScale = d3.scaleBand().domain(sortedStates).range([margin, width-margin]);
        var yScale = d3.scaleLinear().domain([0, d3.max(after2016Data, d => d.totalSales) + topAdjustment]).range([height - margin, margin]); // why is this range inverted
        var colorScale = d3.scaleOrdinal().domain(keys).range(d3.schemeSet3);

        // drawing the axes
        let svg = d3.select("#demo_plot").append("svg").attr("height", height).attr("width", width);
        svg.append("g").attr("transform", "translate(0," + `${height - margin}` + ")").call(d3.axisBottom(xScale)).selectAll("text").style("text-anchor", "end").attr("transform", "rotate(-30)");
        svg.append("g").attr("transform", "translate(" + margin + ", 0)").call(d3.axisLeft(yScale));

        // // drawing the plot using our data
        var stacked = d3.stack().keys(keys)(after2016Data);
        svg.selectAll(".paths").data(stacked).enter().append("path")
            .attr("d", d3.area().x(
                    d => xScale(d.data.state) + xScale.bandwidth() / 2
                ).y0(
                    d => yScale(d[0])
                ).y1(
                    d => yScale(d[1])
                )
            )
            .style("fill", (d) => colorScale(d.key));
        
        // adding appropriate labels and decorations
        svg.append("text").attr("x", width-margin/2).attr("y", height-margin/2).style("text-anchor", "middle").text("States");
        svg.append("text").attr("x", margin).attr("y", margin/2).style("text-anchor", "middle").text("Sales/Profits");
        svg.append("circle").attr("cx", width-margin * 2).attr("cy", margin).attr("r", 6).style("fill", d3.schemeSet3[0]);
        svg.append("circle").attr("cx", width-margin * 2).attr("cy", margin*2).attr("r", 6).style("fill", d3.schemeSet3[1]);
        svg.append("text").attr("x", width-margin*1.5).attr("y", margin + 5).text("Sales");
        svg.append("text").attr("x", width-margin*1.5).attr("y", margin*2 + 5).text("Profit");
        svg.append("text").attr("x", width / 4).attr("y", margin).text("U.S. States' Total E-Commerce Sales & Profit After 2016").attr("font-size", 25);
    });

}