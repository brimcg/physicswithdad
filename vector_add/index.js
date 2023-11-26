// Declare the chart dimensions and margins.
const width = 640;
const height = 640;
const marginTop = 20;
const marginRight = 20;
const marginBottom = 20;
const marginLeft = 20;

const deg = Math.PI/180;
var radiusMax = 100;

var magnitude = function(v) {
	let r = Math.sqrt(v[0]*v[0] + v[1]*v[1]);
	return r;
}

var phase = function(v) {
	let ang = Math.atan2(v[1], v[0])/deg;
	return ang;
}

var polar = function(v) {
	return [magnitude(v), phase(v)];
}

var cartesian = function(v) {
	return [v[0]*Math.cos(v[1]*deg), v[0]*Math.sin(v[1]*deg)]
}

var sumVectors = function(v) {
	sumx = 0;
	sumy = 0;

	v.forEach(d => {
		sumx += d[0];
		sumy += d[1];
	});
	return [sumx, sumy];
}

// Declare the x (horizontal position) scale.
const x = d3.scaleLinear()
	.domain([-radiusMax, radiusMax])
	.range([marginLeft, width - marginRight]);

// Declare the y (vertical position) scale.
const y = d3.scaleLinear()
	.domain([-radiusMax, radiusMax])
	.range([height - marginBottom, marginTop]);

const update = function(vp) {
	var vc = [];
	vp.forEach(d => {
		vc.push(cartesian(d));
	});
	vo = [[0, 0]];
	vc.forEach((d, i) => {
		vo.push(sumVectors([d, vo[i]]));
	});
	vo.pop();
	vo.push([0, 0]);
	var sv = sumVectors(vc);
	vc.push(sv);
	vp.push(polar(sv));

	// Angle arc x-reference
	svg.selectAll(".anglearcx")
		.data(vc)
		.join('path')
			.attr("class", "anglearcx")
			.attr('stroke-width', '1px')
			.attr('stroke', 'gray')
			.attr('fill', 'none')
			.attr('d', (d,i) => {
				return d3.line()([[x(vo[i][0]), y(vo[i][1])], [x(0.25*vp[i][0]+vo[i][0]), y(vo[i][1])]]);
			});

	// Angle arc
	svg.selectAll(".anglearc")
		.data(vp)
		.join("path")
			.attr("class", "anglearc")
			.attr("transform", (d, i) => {return `translate(${x(vo[i][0])}, ${y(vo[i][1])})`;})
			.attr('fill', 'gray')
			.attr("d", d => d3.arc()({
				innerRadius: 0.2*(x(d[0])-x(0))-2,
				outerRadius: 0.2*(x(d[0])-x(0))+2,
				startAngle: 90*deg,
				endAngle: (90 - d[1])*deg
			}));

/*	// Radius reference
	svg.selectAll(".radiusref")
		.data(vp)
		.join("path")
			.attr("class", "radiusref")
			.attr("transform", (d, i) => {return `translate(${x(vo[i][0])}, ${y(vo[i][1])})`;})
			.attr('fill', (d,i) => {return (i < vp.length-1) ? "orange" : "blue";})
			.attr("d", d => d3.arc()({
				innerRadius: (x(d[0])-x(0))-1,
				outerRadius: (x(d[0])-x(0))+0,
				startAngle: 0,
				endAngle: 2*Math.PI
			}));
*/
	// Vector
	svg.selectAll(".vector")
		.data(vc)
		.join('path')
			.attr("class", "vector")
			.attr('stroke-width', '6px')
			.attr('stroke', (d,i) => {return (i < vp.length-1) ? "orange" : "blue";})
			.attr('fill', 'none')
			.attr('d', (d,i) => d3.line()([[x(vo[i][0]), y(vo[i][1])], [x(d[0]+vo[i][0]), y(d[1]+vo[i][1])]]));

	// Vector x-component
	svg.selectAll(".vectorx")
		.data(vc)
		.join('path')
			.attr("class", "vectorx")
			.attr('stroke-width', '3px')
			.attr('stroke', (d,i) => {return (i < vp.length-1) ? "orange" : "blue";})
			.style('stroke-dasharray', ('5,5'))
			.attr('fill', 'none')
			.attr('d', (d,i) => d3.line()([[x(vo[i][0]), y(vo[i][1])], [x(d[0]+vo[i][0]), y(vo[i][1])]]));

	// Vector y-component
	svg.selectAll(".vectory")
		.data(vc)
		.join('path')
			.attr("class", "vectory")
			.attr('stroke-width', '3px')
			.attr('stroke', (d,i) => {return (i < vp.length-1) ? "orange" : "blue";})
			.style('stroke-dasharray', ('5,5'))
			.attr('fill', 'none')
			.attr('d', (d,i) => d3.line()([[x(d[0]+vo[i][0]), y(vo[i][1])], [x(d[0]+vo[i][0]), y(d[1]+vo[i][1])]]));
			var vcf = vc.slice(-1)[0];
			var vpf = vp.slice(-1)[0];
	var data = [
		{"Output Vector" : "Magnitude",	"Symbol" : "V",				"Formula" : "(V<sub>x</sub><sup>2</sup> + V<sub>y</sub><sup>2</sup>)<sup>½</sup>",	"Value" : `${vpf[0].toFixed(3)}`},
		{"Output Vector" : "Angle", 		"Symbol" : "θ",				"Formula" : "atan (V<sub>y</sub> / V<sub>x</sub>)",										"Value" : `${vpf[1].toFixed(3)}°  (= ${(vpf[1]/180).toFixed(3)}π rad)`},
		{"Output Vector" : "x-component",	"Symbol" : "V<sub>x</sub>",	"Formula" : "V cos(θ)",																	"Value" : `${(vcf[0]/1.0).toFixed(3)}`},
		{"Output Vector" : "y-component",	"Symbol" : "V<sub>y</sub>",	"Formula" : "V sin(θ)",																	"Value" : `${(vcf[1]/1.0).toFixed(3)}`}
	];

	table.update(data, ["Output Vector", "Symbol", "Formula", "Value"], "vprop");
}  

// Create the SVG container.
const svg = d3.select("#container").append("svg")
	.attr("width", width)
	.attr("height", height)
	.style("display", "block")
	.style("margin", "auto");

// Add the x-axis, where y = 0
svg.append("g")
	.attr("transform", `translate(0,${y(0)})`)
	.call(d3.axisBottom(x));

// Add the y-axis, where x = 0
svg.append("g")
	.attr("transform", `translate(${x(0)},0)`)
	.call(d3.axisLeft(y));

// Add vector table
table.create([], [], d3.select("#outdata"), "vprop");

// Add initial vector
update([[0, 0],[0, 0],[0, 0]]);

// Add radial overlay
svg.append("path")
	.attr('class', 'vin')
	.attr('id', 'rmax')
	.attr("transform", `translate(${x(0)}, ${y(0)})`)
	.attr("d", d3.arc()({
		innerRadius: 0,
		outerRadius: (x(radiusMax)-x(0)),
		startAngle: 0,
		endAngle: 2*Math.PI
	}))
	.attr('fill', 'lightgray')
	.attr('opacity', 0.2)

var dr, da;
var changing = false;

const change = function(vnew, t) {
	if(changing) return;
	changing = true;
	
	dr = [];
	da = [];
	vnew.forEach((d,i) => {
		dr.push(d[0]-vlast[i][0]);
		da.push(d[1]-vlast[i][1]);
	});

	var at = d3.timer((elapsed) => {
		if(elapsed > t) {
			at.stop();
			update(vnew);
			vlast = vnew;
			changing = false;
			return;
		}

		var fr = elapsed/t;
		vtemp = [];
		vnew.forEach((d,i) => {
			vtemp.push([[fr*dr[i] + vlast[i][0]], [fr*da[i] + vlast[i][1]]]);
		});
		update(vtemp);
	});
}

var indataid = ["vam", "vaa", "vbm", "vba", "vcm", "vca"];
var indata = [
		{"Input Vector" : "Magnitude",	"A" : `<input type="number" id="${indataid[0]}" min="0" max="100" value="50" size="9">`,	"B" : `<input type="number" id="${indataid[2]}" min="0" max="100" value="30" size="9">`,	"C" : `<input type="number" id="${indataid[4]}" min="0" max="100" value="80" size="9">`},
		{"Input Vector" : "Angle",	"A" : `<input type="number" id="${indataid[1]}" value="50" size="9">`,	"B" : `<input type="number" id="${indataid[3]}" value="110" size="9">`,	"C" : `<input type="number" id="${indataid[5]}" value="-170" size="9">`}
];

table.create(indata, ["Input Vector", "A", "B", "C"], d3.select("#indata"), "vpropin");

getInput = function() {
	indataval = [];
	indataid.forEach(d => {
		indataval.push(+d3.select(`#${d}`).property("value"));
	});
	return [[indataval[0], indataval[1]], [indataval[2], indataval[3]], [indataval[4], indataval[5]]];
}

var vlast = getInput();
update(vlast);

d3.select("#vpropin").selectAll("tr").selectAll("td")
	.on("change", () => {change(getInput(), 200)});

