function fact(n) {
	let val = 1;

	for (let i = 2; i <= n; i++) val = val * i;

	return val;
}

function nCr(n, r) {
	return fact(n) / (fact(r) * fact(n - r));
}

function attempt() {
	const n = parseInt(document.getElementById('n').value),
		x = parseInt(document.getElementById('x').value),
		p = parseFloat(document.getElementById('p').value),
		q = 1 - p;

	if (x <= n && x >= 0 && p >= 0 && p <= 1 && n >= 0) {
		const data = getDataPoints(n, x, p, q),
			answer = data[x].y;

		document.getElementById('result').innerText = answer;

		drawGraph(data);
	} else {
		document.getElementById('graph').innerHTML = '';

		let b = document.createElement('b');
		b.id = 'warning';
		b.innerText = 'INPUT VALID VALUES';

		document.getElementById('graph').appendChild(b);

		document.getElementById('result').innerText = '';
	}
}

function round(value, decimals) {
	return parseFloat(value.toFixed(decimals));
}

function getDataPoints(n, x, p, q) {
	const temp = [],
		operation = document.querySelector('#prob-calc').value;

	for (let i = 0; i <= n; i++) {
		temp.push({
			x: i,
			y: nCr(n, i) * Math.pow(p, i) * Math.pow(q, n - i),
			highlight: false,
		});
	}

	//P(X = x)
	if (operation.includes('P(X = x)')) {
		return temp.map((d) => {
			d.y = round(d.y, 4);
			if (d.x === x) d.highlight = true;
			return d;
		});
	}

	//P(X <= x) || P(X >= x)
	if (operation.includes('<=') || operation.includes('>=')) {
		const dataPoints = [];
		for (let i = 0; i < temp.length; i++) {
			let sum = 0;
			for (let j = i; j >= 0; j--) {
				sum += temp[j].y;
			}

			//P(X <= x)
			if (operation.includes('<=')) {
				dataPoints.push({
					x: i,
					y: parseFloat(round(sum, 4)),
					highlight: i === x,
				});
			}

			//P(X >= x)
			if (operation.includes('>=')) {
				dataPoints.push({
					x: i,
					y: parseFloat(round(1 - sum, 4)),
					highlight: i === x,
				});
			}
		}

		return dataPoints;
	}
}

function drawGraph(dataPoints) {
	const margin = { top: 20, right: 20, bottom: 30, left: 40 };
	const width = 800 - margin.left - margin.right;
	const height = 500 - margin.top - margin.bottom;

	const xScale = d3.scaleBand().range([0, width]).round(true).paddingInner(0.1); // space between bars (it's a ratio)

	const yScale = d3.scaleLinear().range([height, 0]);

	const xAxis = d3.axisBottom().scale(xScale);

	const yAxis = d3.axisLeft().scale(yScale);

	d3.select('#graph').html('');

	const svg = d3
		.select('#graph')
		.append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', `translate(${margin.left}, ${margin.right})`);

	const tooltip = d3.select('#graph').append('div').attr('class', 'tooltip').style('opacity', 0);

	xScale.domain(dataPoints.map((d) => d.x));

	const maxValue = d3.max(dataPoints, (d) => d.y);
	yScale.domain([0, maxValue]);

	svg.append('g').attr('class', 'x axis').attr('transform', `translate(0, ${height})`).call(xAxis);

	svg.append('g').attr('class', 'y axis').call(yAxis).append('text').attr('transform', 'rotate(-90)').attr('y', 6).attr('dy', '.71em').style('text-anchor', 'end').text('Probability');

	const barClasses = (d) => (d.highlight ? 'bar highlight' : 'bar');

	svg.selectAll('.bar')
		.data(dataPoints)
		.enter()
		.append('rect')
		.attr('class', (d) => barClasses(d))
		.attr('x', (d) => xScale(d.x))
		.attr('width', xScale.bandwidth())
		.attr('y', (d) => yScale(d.y))
		.attr('height', (d) => height - yScale(d.y))
		.on('mouseover', (d) => {
			tooltip.transition().duration(200).style('opacity', 0.9);
			const operation = document.querySelector('#prob-calc').value.replace('x', d.x);
			tooltip.html(`${operation} = ${d.y}`).style('left', `${d3.event.pageX}px`).style('top', `${d3.event.pageY}px`);
		})
		.on('mouseout', () => tooltip.transition().duration(500).style('opacity', 0));
}
