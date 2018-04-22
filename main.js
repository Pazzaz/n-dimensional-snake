function k_combinations(set, k) {
    let i, j, combs, head, tailcombs;
    if (k > set.length || k <= 0) {
        return [];
    }
    if (k == set.length) {
        return [set];
    }
    if (k == 1) {
        combs = [];
        for (i = 0; i < set.length; i++) {
            combs.push([set[i]]);
        }
        return combs;
    }
    combs = [];
    for (i = 0; i < set.length - k + 1; i++) {
        // head is a list that includes only our current element.
        head = set.slice(i, i + 1);
        // We take smaller combinations from the subsequent elements
        tailcombs = k_combinations(set.slice(i + 1), k - 1);
        // For each (k-1)-combination we join it with the current
        // and store it to the set of k-combinations.
        for (j = 0; j < tailcombs.length; j++) {
            combs.push(head.concat(tailcombs[j]));
        }
    }
    return combs;
}



const keybindings = [
    [
        { "up": "1", "down": "q" },
        { "up": "2", "down": "w" },
        { "up": "3", "down": "e" },
        { "up": "4", "down": "r" },
        { "up": "5", "down": "t" },
        { "up": "6", "down": "y" },
        { "up": "7", "down": "u" },
        { "up": "8", "down": "i" },
        { "up": "9", "down": "o" },
        { "up": "0", "down": "p" },

    ],
    [
        { "up": "k", "down": "m" },
        { "up": "j", "down": "n" },
        { "up": "h", "down": "b" },
        { "up": "g", "down": "v" },
        { "up": "f", "down": "c" },
        { "up": "d", "down": "x" },
        { "up": "s", "down": "z" },
    ]
]

let players = {
    "player1": { "id": 1, "input": false },
    "player2": { "id": 2, "input": false },
}
let width = 3;
let dimensions = 4;
function deepSlice(items, start, end) {
    if (typeof items[0] !== 'object') {
        return Object.assign({}, items)
    }
    return items.map(function (item) {
        return deepSlice(item, start, end)
    })
}

function generate_blocks() {
    let blocks = [{ "goal": false, "player": false }]
    for (let i = 0; i < dimensions; i++) {
        let deeper = deepSlice(blocks, 0, blocks.length - 1)
        let container = new Array(width)
        for (let a = 0; a < width; a++) {
            container[a] = deepSlice(deeper, 0, deeper.length - 1)
        }
        blocks = deepSlice(container, 0, container.length - 1)
    }
    return blocks
}
var blocks = generate_blocks()

function deep_get(array, indices) {
    let depth = array;
    for (let i = 0; i < indices.length; i++) {
        depth = depth[indices[i]]
    }
    return depth
}

function equal(arr1, arr2) {
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] != arr2[i]) {
            return false;
        }
    }
    return true;
}

function includes_equal(list, element) {
    for (const element_in_list of list) {
        if (equal(element_in_list, element)) {
            return true;
        }
    }
    return false;
}

function make_slice(array, axis_1, axis_2, axis_values) {
    coords = axis_values.slice()
    let out = []
    for (let a = 0; a < width; a++) {
        coords[axis_1] = a
        for (let b = 0; b < width; b++) {
            coords[axis_2] = b
            let display_part = { "coords": coords.slice(), "x": b * 10 + 8, "y": a * 10 + 8, "info": deep_get(array, coords)[0] }
            out.push(display_part)
        }
    }
    return out
}

let possible_dimensions = []
for (let i = 0; i < dimensions; i++) {
    possible_dimensions.push(i);
}
var boards = k_combinations(possible_dimensions, 2)
for (const name of Object.keys(players)) {
    const player = players[name]
    let player_boards = []
    for (let element of boards) {
        let slice = make_slice(blocks, element[0], element[1], random_coord())
        let container = d3.select("." + name)
            .append("svg")
            .attr("id", name + element[0] + "" + element[1])
            .attr("viewBox", "0 0 46 46")
            .style("width", "200px")
            .style("height", "200px");
        container
            .append("text")
            .attr("fill", "#FFF1E8")
            .attr("x", 23)
            .attr("y", 5)
            .attr("text-anchor", "middle")
            .attr("font-size", 4)
            .style("font-family", "Sans-Serif")
            .text("" + keybindings[player.id - 1][element[0]].up);
        container
            .append("text")
            .attr("fill", "#FFF1E8")
            .attr("x", 23)
            .attr("y", 43)
            .attr("text-anchor", "middle")
            .attr("font-size", 4)
            .text("" + keybindings[player.id - 1][element[0]].down);

        container
            .append("text")
            .attr("fill", "#FFF1E8")
            .attr("x", 5)
            .attr("y", 23)
            .attr("text-anchor", "middle")
            .attr("font-size", 4)
            .text("" + keybindings[player.id - 1][element[1]].up);
        container
            .append("text")
            .attr("fill", "#FFF1E8")
            .attr("x", 41)
            .attr("y", 23)
            .attr("text-anchor", "middle")
            .attr("font-size", 4)
            .text("" + keybindings[player.id - 1][element[1]].down);
        let dom = container
            .selectAll("rect")
            .data(slice)
            .enter()
            .append("rect")
            .attr("x", function (d) { return d.x })
            .attr("width", function (d) { return 10.2 })
            .attr("height", function (d) { return 10.2 })
            .attr("y", function (d) { return d.y })
            .attr("true_coords", function (d) { return d.coords; });
    }
}


var stats = d3.select(".stats").append("svg")
    .attr("viewBox", "0 0 40 40")

var player_1_score = stats.append("text")
    .attr("x", 3)
    .attr("y", 12)
    .attr("text-anchor", "middle")
    .attr("font-size", 4)
    .attr("fill", "#FF004D")
    .text(0)
var player_2_score = stats.append("text")
    .attr("x", 37)
    .attr("y", 12)
    .attr("text-anchor", "middle")
    .attr("font-size", 4)
    .attr("fill", "#FFA300")
    .text(0)

function draw() {
    blocks = generate_blocks()
    for (const name of Object.keys(players)) {
        const player = players[name]
        for (const element of player.snake) {
            deep_get(blocks, element)[0]["player"] = "" + player.id
        }
        deep_get(blocks, player.snake[player.snake.length - 1])[0]["player"] = "head" + player.id
    }
    deep_get(blocks, goal)[0]["goal"] = true
    for (const name of Object.keys(players)) {
        const player = players[name]
        for (const element of boards) {
            let slice = make_slice(blocks, element[0], element[1], player.snake[player.snake.length - 1])
            d3.select("#" + name + element[0] + "" + element[1])
                .selectAll("rect")
                .data(slice)
                .enter();
            d3.select("#" + name + element[0] + "" + element[1])
                .selectAll("rect")
                .attr("true_coords", function (d) { return d.coords; })
                .style("fill", (d) => {
                    if (d.info.goal) {
                        return "#008751"
                    } else if (d.info.player) {
                        if (d.info.player == "head1") {
                            return "#FF004D"
                        } else if (d.info.player == "1") {
                            return "#7E2553"
                        } else if (d.info.player == "head2") {
                            return "#FFA300"
                        } else if (d.info.player == "2") {
                            return "#AB5236"
                        } else {
                            console.error("INVALID PLAYER");
                        }
                    } else {
                        return "#FFF1E8"
                    };
                });

        }
    }
}

function random_coord() {
    let output = []
    for (let i = 0; i < dimensions; i++) {
        output.push(Math.floor((Math.random() * width)))
    }
    return output
}

function elementwise_add(array1, array2) {
    let out = []
    for (let i = 0; i < array1.length; i++) {
        const one = array1[i];
        const two = array2[i];
        out.push(one + two)
    }
    return out
}
var goal;
function reset() {
    blocks = generate_blocks()
    goal = random_coord()
    for (const name of Object.keys(players)) {
        const player = players[name]
        player.snake = [random_coord()]
        player["direction"] = [0, 0, 0]
    }
    draw()
}
reset()

function add_to_snake(player) {
    let new_head = elementwise_add(player.snake[player.snake.length - 1], player.direction)
    player.snake.push(new_head)
    if (new_head.includes(-1) || new_head.includes(width)) {
        return "failed";
    }
}

function collision() {
    let taken_positions = []
    for (const name of Object.keys(players)) {
        const player = players[name]
        taken_positions = taken_positions.concat(player.snake.slice(0, player.snake.length - 1))
    }

    for (const name of Object.keys(players)) {
        const player = players[name]
        let head = player.snake[player.snake.length - 1]
        for (const pos of taken_positions) {
            if (equal(head, pos)) {
                console.log("CRASH");
                return name;
            }
        }
    }
    if (equal(players["player1"].snake[players["player1"].snake.length - 1], players["player2"].snake[players["player2"].snake.length - 1])) {
        console.log("HEAD CRASH");
        return "both";
    }
    return false
}

function shorten_snakes() {
    let goal_taken = false;
    for (const name of Object.keys(players)) {
        const player = players[name]
        if (equal(player.snake[player.snake.length - 1], goal)) {
            goal_taken = true
        } else {
            let removed = player.snake.shift();
        }
    }
    return goal_taken
}

function step() {
    if (add_to_snake(players["player1"]) == "failed") {
        player_2_score.text(parseInt(player_2_score.text()) + 1)
        reset()
        return;
    }
    if (add_to_snake(players["player2"]) == "failed") {
        player_1_score.text(parseInt(player_1_score.text()) + 1)
        reset()
        return;
    }
    goal_taken = shorten_snakes()
    if (goal_taken) {
        while (includes_equal(players["player1"].snake, goal) || includes_equal(players["player2"].snake, goal)) {
            goal = random_coord()
        }
    }
    let result = collision()
    if (result) {
        if (result == "player1") {
            player_2_score.text(parseInt(player_2_score.text()) + 1)
        } else if (result == "player2") {
            player_1_score.text(parseInt(player_1_score.text()) + 1)
        }
        reset()
        return;
    }
    draw()
}

document.addEventListener("keydown", (event) => {
    for (const name of Object.keys(players)) {

        const player = players[name]
        if (!player.input) {
            let direction = new Array(dimensions).fill(0)
            let checking = new Array(dimensions).fill(0)
            let clicked = false;
            for (let a = 0; a < dimensions; a++) {
                if (event.key == keybindings[player.id - 1][a].up) {
                    clicked = true
                    direction[a] = -1;
                    checking[a] = 1
                    break;
                } else if (event.key == keybindings[player.id - 1][a].down) {
                    clicked = true
                    direction[a] = 1;
                    checking[a] = -1;
                    break;
                }
            }
            if (clicked && !equal(checking, player.direction)) {
                player.input = true
                player.direction = direction
            } else {
                player.input = false
            }

        }
    }
    let valid = true;
    for (const name of Object.keys(players)) {
        const player = players[name]
        if (!player.input) {
            valid = false
        }
    }
    if (valid) {
        for (const name of Object.keys(players)) {
            players[name].input = false
        }
        step()
    }
}, false);