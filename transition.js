//load data----


async function createApp(){
    const dataset= await d3.csv('data.csv')

    console.log(dataset)
   
    //create dimensions---
    let dimensions={
        width: 800,
        height:600,
        margins: {
            left: 50,
            right: 20,
            top:20,
            bottom: 50,
        },
    };

    //bound dimensions
    dimensions.boundedwidth=dimensions.width-
        dimensions.margins.left-
        dimensions.margins.right;
    dimensions.boundedheight=dimensions.height-
        dimensions.margins.top-
        dimensions.margins.bottom;


    //Draw canvas----
    wrapper=d3.select("#vis")
        .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height);

    bounds=wrapper.append("g")
        .style("transform", `translate(${
            dimensions.margins.left
        }px, ${
            dimensions.margins.top
        }px)`);
        
    //create scales------
    const xScatterscale= d3.scaleLinear()
        .range([0, dimensions.boundedwidth])
        .nice()        

    const yScatterscale= d3.scaleLinear()
        .range([dimensions.boundedheight, 0])
        .nice()       


    const xBarscale= d3.scaleBand()
        .range([0, dimensions.boundedwidth])
        .padding(0.2)
    
    const yBarscale=d3.scaleLinear()
        .range([dimensions.boundedheight, 0])
        .nice()

    //Draw perpherals--axes-------
    //create axis generators
    const xAxisgeneratorscatter= d3.axisBottom()
        .scale(xScatterscale)
        .ticks(8)      

    const yAxisgeneratorscatter= d3.axisLeft()
        .scale(yScatterscale)
        .ticks(9)
      

    const xAxisgeneratorbar=d3.axisBottom()
        .scale(xBarscale)

    const yAxisgeneratorbar=d3.axisLeft()
        .scale(yBarscale)

//creating a group element which contains all the things related to x-axis like axis and the labels
    bounds.append("g")
        .attr("class", "x-axis")
            .style("transform", `translateY(${
                dimensions.boundedheight
            }px)`)  
        .append("text")
            .attr("class", "x-axis-label")
            .attr("x", dimensions.boundedwidth/2)
            .attr("y", dimensions.margins.bottom-10)
            .attr("fill", "black")
            .style("font-size", "1.4em")
            
//creating a group element which contains all the things related to y-axis like axis and the labels
    bounds.append("g")
        .attr("class", "y-axis")
        .append("text")
            .attr("class", "y-axis-label")
            .attr("x", -dimensions.boundedheight/2)
            .attr("y", -dimensions.margins.left+10)
            .attr("fill", "black")
            .style("font-size", "1.4em")
            .style("transform", "rotate(-90deg)")
            .style("text-anchor", "middle")  
    
        

   //binding data to empty request----- 
    const requests= bounds.append("g")
            .attr("class", "request")

    const chartgroups= requests.selectAll(".request")
                .data(dataset)
                .enter().append("g")

    let duration = 750           

    //const updateTransition = d3.transition().duration(duration)  

    const updateTransition = (t) => {
        return t.duration(duration)
    }

    var previousChartType = "scatter";
     
    scatterplot();
   
    
    //create functions to draw data scatter plot----
    function scatterplot(){

        const xAccessorscatter= d=> +d.risk
        const yAccessorscatter= d=> +d.return

        xScatterscale.domain([0, d3.max(dataset, xAccessorscatter)+0.05])
        yScatterscale.domain([0, d3.max(dataset, yAccessorscatter)+0.02])

        const xAxis=bounds.select(".x-axis")
            .transition()
            .call(updateTransition)
            .call(xAxisgeneratorscatter)   
            
            
        const xAxislabel= xAxis.select(".x-axis-label")
                    .transition()
                    .call(updateTransition)
                    .text("Risk")

        const yAxis= bounds.select(".y-axis")
            .transition()
            .call(updateTransition)
            .call(yAxisgeneratorscatter)


        const yAxislabel= yAxis.select(".y-axis-label")
            .transition()
            .call(updateTransition)
            .text("Return")

        const newscattergroup= chartgroups.append("circle")
            .attr("cx", d=>xScatterscale(xAccessorscatter(d)))
            .attr("cy", dimensions.boundedheight)
            .attr("r", 0)

        const scattergroups= newscattergroup
                .transition().duration(previousChartType === "bar" ? duration : 0)
                // .call(updateTransition)
                    .attr("cx", d=>xScatterscale(xAccessorscatter(d)))
                    .attr("cy", d=>yScatterscale(yAccessorscatter(d)))
                    .attr("r", 5)
                    .attr("fill", "red")     
                    
        previousChartType = "scatter";
} 

    //create functions to draw data bar plot----
    function plotbar(){

        const xAccessorbar = d=> d.id
        const yAccessorbar = d=> +d.equity

        xBarscale
            .domain(dataset.map(xAccessorbar))
            
        yBarscale
            .domain([0, d3.max(dataset, yAccessorbar)+0.1])
      
        const xAxis=bounds.select(".x-axis")
            .transition()
            .call(updateTransition)
            .call(xAxisgeneratorbar)

        const xAxislabel=xAxis.select(".x-axis-label")
                    .transition()
                    .call(updateTransition)
                    .text("id")

        const yAxis=bounds.select(".y-axis")
                .transition()
                .call(updateTransition)
                .call(yAxisgeneratorbar)

        const yAxislabel=yAxis.select(".y-axis-label")
                .transition()
                .call(updateTransition)
                .text("Equity")

        const newbarsgroups= chartgroups.append("rect")
            .attr("x", d=> xBarscale(d.id))
            .attr("height", 0)
            .attr("y", dimensions.boundedheight)
            .attr("width", xBarscale.bandwidth())

        const t= newbarsgroups
                .transition().duration(previousChartType === "scatter" ? duration : 0)
                //.call(updateTransition)
                    .attr("x", d=> xBarscale(d.id))
                    .attr("y", d=> yBarscale(d.equity))
                    .attr("width", xBarscale.bandwidth())
                    .attr("height", d=>dimensions.boundedheight- yBarscale(yAccessorbar(d)))
                    .attr("fill", "cornflowerblue")
     
        
        const barText= chartgroups.filter(yAccessorbar)
            .append("text")
            .attr("x", d=>xBarscale(d.id)+(xBarscale.bandwidth())/2)
            .attr("y", dimensions.boundedheight)
            .transition().duration(previousChartType === "scatter" ? duration : 0)
            // .call(updateTransition)
                .attr("x", d=>xBarscale(d.id)+(xBarscale.bandwidth())/2)
                .attr("y", d=>yBarscale(yAccessorbar(d))-5)
                .text(yAccessorbar)
                .style("text-anchor", "middle")
                .attr("fill", "black")
                .style("font-size", "12px")
                .style("font-family", "sans-serif")       
                
        previousChartType = "bar";

    }
 
        d3.select("#scatter").on("click", function () {
            chartgroups
            .selectAll("rect")
            .attr("fill-opacity", 1)
            .transition()
            .duration(duration)
            .attr("y", dimensions.boundedheight)
            .attr("height", 0)
            .attr("fill-opacity", 0)
            .remove();

            chartgroups
            .select("text")
            .transition()
            .duration(duration)
            .attr("fill", "white")
            .remove();
    
            scatterplot()
                      
          });

        
        d3.select("#bar").on("click", function () {
            chartgroups
                 .selectAll("circle")
                 .attr("fill-opacity", 1)
                .transition()
                .duration(duration)
                .attr("fill-opacity", 0)
                .remove();
                
            plotbar()
          
          });

}

createApp()