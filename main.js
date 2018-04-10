var format = d3.format(",");

// Set tooltips
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function (d) {
    return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Population: </strong><span class='details'>" + format(d.population) + "</span>";
  })

var margin = { top: 0, right: 0, bottom: 0, left: 0 },
  width = 960 - margin.left - margin.right,
  height = 700 - margin.top - margin.bottom;

var color = d3.scaleThreshold()
  .domain([10000, 100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000, 500000000, 1500000000])
  .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)", "rgb(3,19,43)"]);

var path = d3.geoPath();

var years = []

countryData.forEach(function (d) { years.push(d.Year) });

years = [...new Set(years)];

var select = d3.select('body')
  .append('select')
    .attr('class','select')
    .attr("id", "myselect") 
    .on('change',onchange)

var options = select
  .selectAll('option')
	.data(years).enter()
	.append('option')
    .text(function (d) { return d; });

var button = d3.select('body')
  .append('input')
    .attr('id', 'playButton')
    .attr('Value', 'Play')
    .attr('type','button')
    .attr('onclick', 'contador = document.getElementById("myselect").selectedIndex ; play()')

function play() {
    window.setTimeout(function () {
      if (contador == -1){
        return ;
      }
        queue()
          .defer(d3.json, "world_countries.json")
          .defer(d3.tsv, "world_population.tsv")
          .await(ready);
    
        year = years[contador];
        document.getElementById('myselect').getElementsByTagName('option')[contador].selected = 'selected' ;
        year_population = countryData.filter(checkYear);
        contador++;
        if (contador < years.length){
          play();
        }
    }, 500);
}

var button = d3.select('body')
  .append('input')
    .attr('id', 'stopButton')
    .attr('Value', 'Stop')
    .attr('type','button')
    .attr('onclick', 'stop()')

function stop() {
  contador = -1;
  play();
}
function onchange() {
  queue()
  .defer(d3.json, "world_countries.json")
  .defer(d3.tsv, "world_population.tsv")
  .await(ready);

  var sel = document.getElementById('myselect');
  year = sel.options[sel.selectedIndex].value
  year_population = countryData.filter(checkYear)

};

var svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append('g')
  .attr('class', 'map');

var projection = d3.geoMercator()
  .scale(130)
  .translate([width / 2, height / 1.5]);

var path = d3.geoPath().projection(projection);

svg.call(tip);

// World_countries extracted from: https://raw.githubusercontent.com/jdamiani27/Data-Visualization-and-D3/master/lesson4/world_countries.json
 queue()
  .defer(d3.json, "world_countries.json")
  .defer(d3.tsv, "world_population.tsv")
  .await(ready);

var sel = document.getElementById('myselect');
year = sel.options[sel.selectedIndex].value

function checkYear(d) {
  return d.Year == year;
}

year_population = countryData.filter(checkYear)

function ready(error, data, population) {
  var populationById = {};
  for(i=0; i < year_population.length; i++) {
     for(j=0; j < population.length; j++) {
       if(year_population[i]['Country Name'] == population[j].name){
         population[j].population = year_population[i].Value
       }
     }
  }
  population.forEach(function (d) { populationById[d.id] = +d.population; });
  data.features.forEach(function (d) { d.population = populationById[d.id] });

  svg.append("g")
    .attr("class", "countries")
    .selectAll("path")
    .data(data.features)
    .enter().append("path")
    .attr("d", path)
    .style("fill", function (d) { return color(populationById[d.id]); })
    .style('stroke', 'white')
    .style('stroke-width', 1.5)
    // tooltips
    .style("stroke", "white")
    .style('stroke-width', 0.3)
    .on('mouseover', function (d) {
      tip.show(d);

      d3.select(this)
        .style("stroke", "white")
        .style("stroke-width", 3);
    })
    .on('mouseout', function (d) {
      tip.hide(d);

      d3.select(this)
        .style("stroke", "white")
        .style("stroke-width", 0.3);
    });

  /*
    svg.append("path")
    .datum(topojson.mesh(data.features, function (a, b) { return a.id !== b.id; }))

    .attr("class", "names")
    .attr("d", path);
  */
}




