//@Copyright Tom-Alexander

function lr(data) {

    var sum = [0, 0, 0, 0, 0], n = 0, results = [];

    for (; n < data.length; n++) {
        if (data[n][1] != null) {
            sum[0] += data[n][0];
            sum[1] += data[n][1];
            sum[2] += data[n][0] * data[n][0];
            sum[3] += data[n][0] * data[n][1];
            sum[4] += data[n][1] * data[n][1];
        }
    }

    var gradient = (n * sum[3] - sum[0] * sum[1]) / (n * sum[2] - sum[0] * sum[0]);
    var intercept = (sum[1] / n) - (gradient * sum[0]) / n;

    for (var i = 0, len = data.length; i < len; i++) {
        var coordinate = [data[i][0], data[i][0] * gradient + intercept];
        results.push(coordinate);
    }

    var string = 'y = ' + Math.round(gradient*100) / 100 + 'x + ' + Math.round(intercept*100) / 100;

    return {equation: [gradient, intercept], points: results, string: string};
}
            
var data = [
	[1, 2.1],
	[2, 4.2],
	[3, 5.9],
	[4, 7.7],
	[5, 9.9]
];

// var result = lr(data);
console.log(data);