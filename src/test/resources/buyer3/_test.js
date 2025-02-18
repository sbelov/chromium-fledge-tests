function randomVector(n) {
    const vector = new Array(n);
    for (let i = 0; i < n; i++) {
        vector[i] = Math.random();
    }
    return vector;
}

function randomMatrix(n, m) {
    const matrix = new Array(n);
    for (let i = 0; i < n; i++) {
        matrix[i] = randomVector(m);
    }
    return matrix;
}

function multiply(a, b) {
  if (a[0].length !== b.length) {
     throw new Error("invalid matrix dimensions");
  }
  var v = new Array(a.length);
  for (var i = 0; i < a.length; i++) {
    v[i] = 0;
    for (var j = 0; j < b.length; j++) {
      v[i] += a[i][j] * b[j];
    }
  }
  return v;
}

function relu(a) {
    if (a.length > 0) {
        for (let i = 0; i < a.length; ++i) {
            a[i] = Math.max(0, a[i]);
        }
    }
    return a;
}

function nn_forward(input, nn_model_weights) {
    let X = input;
    X = relu(multiply(nn_model_weights[0], X));
    X = relu(multiply(nn_model_weights[1], X));
    X = relu(multiply(nn_model_weights[2], X));
    X = relu(multiply(nn_model_weights[3], X));
    return X[0];
}

function test(warmups, loops) {
    if (warmups > loops) {
        throw new Error("warmups greater than loops");
    }
    let bids = new Array(loops);
    let inputs = new Array(loops);
    let nn_model_weights = new Array(loops);

    for (let i = 0; i < loops; i++) {
        inputs[i] = randomVector(200);
        nn_model_weights[i] = new Array(4);
        nn_model_weights[i][0] = randomMatrix(200, 200);
        nn_model_weights[i][1] = randomMatrix(100, 200);
        nn_model_weights[i][2] = randomMatrix(50, 100);
        nn_model_weights[i][3] = randomMatrix(1, 50);
    }
    let start = 0;
    for (let i = 0; i < loops; i++) {
        if (i == warmups) {
            start = new Date().getTime();
        }
        bids[i] = nn_forward(inputs[i], nn_model_weights[i]);
    }
    let end = new Date().getTime();

    console.log("results for %d iterations: %s", loops, bids);
    console.log("time spent on 1 loop in avg: %d ms", ((end - start) / (loops - warmups)));

}

test(10, 100)
