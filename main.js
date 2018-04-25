var origin = [190, 200], scale = 20, j = 10, cubesData = [], alpha = 0, beta = 0, startAngle = Math.PI / 6;
var svg = d3.select('#three').call(d3.drag().on('drag', dragged).on('start', dragStart).on('end', dragEnd)).append('g');
var cubesGroup = svg.append('g').attr('class', 'cubes');
var mx, my, mouseX, mouseY;

let players = {
    "player1": {
        "input": false, "main_colour": "#FF004D", "secondary_colour": "#7E2553", "snake": [], "keybindings": [
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
    },
    "player2": {
        "input": false, "main_colour": "#FFA300", "secondary_colour": "#AB5236", "snake": [], "keybindings": [
            { "up": "k", "down": "m" },
            { "up": "j", "down": "n" },
            { "up": "h", "down": "b" },
            { "up": "g", "down": "v" },
            { "up": "f", "down": "c" },
            { "up": "d", "down": "x" },
            { "up": "s", "down": "z" },
        ]
    },
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

var cubes3D = d3._3d()
    .shape('CUBE')
    .x(function (d) { return d.x; })
    .y(function (d) { return d.y; })
    .z(function (d) { return d.z; })
    .rotateY(startAngle)
    .rotateX(-startAngle)
    .origin(origin)
    .scale(20);

function processData(data, tt) {

    /* --------- CUBES ---------*/

    var cubes = cubesGroup.selectAll('g.cube').data(data, function (d) { return d.id });

    var ce = cubes
        .enter()
        .append('g')
        .attr('class', 'cube')
        .attr('fill', function (d) { return d.color; })
        .attr('stroke', function (d) { return "black"; })
        .merge(cubes)
        .sort(cubes3D.sort);
    ce
        .transition()
        .attr('fill', function (d) { return d.color; })
    cubes.exit().remove();

    /* --------- FACES ---------*/

    var faces = cubes.merge(ce).selectAll('path.face').data(function (d) { return d.faces; }, function (d) { return d.face; });

    faces.enter()
        .append('path')
        .attr('class', 'face')
        .attr('fill-opacity', 0.95)
        .classed('_3d', true)
        .merge(faces)
        .transition().duration(tt)
        .attr('d', cubes3D.draw);

    faces.exit().remove();

    /* --------- SORT TEXT & FACES ---------*/

    ce.selectAll('._3d').sort(d3._3d().sort);

}
const width = 3;


function generate_cubedata_from_blocks(dat) {
    let cubesData = []
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < width; y++) {
            for (let z = 0; z < width; z++) {
                let index = x + width * y + (width ** 2) * z
                let cube = makeCube(x - 1, y - 1, z - 1, index)
                let info = dat.get([x, y, z])[0]

                if (info.goal) {
                    cube.color = "#008751"
                } else if (info.player) {

                    if (info.player[1]) {
                        cube.color = players[info.player[0]].main_colour
                    } else {
                        cube.color = players[info.player[0]].secondary_colour
                    }
                } else {
                    cube.color = "#FFF1E8"
                }

                cubesData.push(cube)
            }
        }
    }
    return cubesData
}

function init(blocks) {
    cubesData = generate_cubedata_from_blocks(blocks)
    processData(cubes3D(cubesData), 1000);
}

function dragStart() {
    mx = d3.event.x;
    my = d3.event.y;
}

function dragged() {
    mouseX = mouseX || 0;
    mouseY = mouseY || 0;
    beta = (d3.event.x - mx + mouseX) * Math.PI / 230;
    alpha = (d3.event.y - my + mouseY) * Math.PI / 230 * (-1);
    processData(cubes3D.rotateY(beta + startAngle).rotateX(alpha - startAngle)(cubesData), 0);
}

function dragEnd() {
    mouseX = d3.event.x - mx + mouseX;
    mouseY = d3.event.y - my + mouseY;
}

function makeCube(x, y, z, id) {
    let a = [
        { x: 5 * x - 1, y: 5 * y + 1, z: 5 * z + 1 }, // FRONT TOP LEFT
        { x: 5 * x - 1, y: 5 * y - 1, z: 5 * z + 1 }, // FRONT BOTTOM LEFT
        { x: 5 * x + 1, y: 5 * y - 1, z: 5 * z + 1 }, // FRONT BOTTOM RIGHT
        { x: 5 * x + 1, y: 5 * y + 1, z: 5 * z + 1 }, // FRONT TOP RIGHT
        { x: 5 * x - 1, y: 5 * y + 1, z: 5 * z - 1 }, // BACK  TOP LEFT
        { x: 5 * x - 1, y: 5 * y - 1, z: 5 * z - 1 }, // BACK  BOTTOM LEFT
        { x: 5 * x + 1, y: 5 * y - 1, z: 5 * z - 1 }, // BACK  BOTTOM RIGHT
        { x: 5 * x + 1, y: 5 * y + 1, z: 5 * z - 1 }, // BACK  TOP RIGHT
    ];
    a.id = id
    return a
}

var boards;
var blocks;

let dimensions = 3;


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

function generate_blocks() {
    let blocks = []
    for (let i = 0; i < width ** dimensions; i++) {
        blocks.push([{ "goal": false, "player": false }])
    }
    blocks.get = function (indices) {
        let total_index = 0;
        for (let i = 0; i < indices.length; i++) {
            total_index += (3 ** i) * indices[i]
        }
        // HACK
        if (total_index >= this.length) {
            return [{ "goal": false, "player": false }]
        }
        return this[total_index]
    }
    return blocks
}

function random_coord() {
    let output = []
    for (let i = 0; i < dimensions; i++) {
        output.push(Math.floor((Math.random() * width)))
    }
    return output
}


// TODO: It sometimes chooses occupied positions
function get_empty_coord() {
    coord = random_coord()
    while ((blocks.get(coord)[0].goal || blocks.get(coord)[0].player)) {
        coord = random_coord()
    }
    return coord
}

function get_chosen_coords(axis_1, axis_2, axis_values) {
    coords = axis_values.slice()
    let out = []
    for (let a = 0; a < width; a++) {
        coords[axis_1] = a
        for (let b = 0; b < width; b++) {
            coords[axis_2] = b
            out.push(coords.slice())
        }
    }
    return out
}

function make_slice(array, axis_1, axis_2, axis_values) {
    coords = axis_values.slice()
    let out = []
    for (let a = 0; a < width; a++) {
        coords[axis_1] = a
        for (let b = 0; b < width; b++) {
            coords[axis_2] = b
            let display_part = { "coords": coords.slice(), "x": b * 10 + 8, "y": a * 10 + 8, "info": array.get(coords)[0] }
            out.push(display_part)
        }
    }
    return out
}
function remake() {
    blocks = generate_blocks()
    let possible_dimensions = []
    for (let i = 0; i < dimensions; i++) {
        possible_dimensions.push(i);
    }
    boards = k_combinations(possible_dimensions, 2)
    for (const name of Object.keys(players)) {
        d3.select("." + name).selectAll("svg").remove()
        const player = players[name]
        let player_boards = []
        for (let element of boards) {
            let slice = make_slice(blocks, element[0], element[1], get_empty_coord())
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
                .attr("id", "up-" + element[0])
                .text("" + player.keybindings[element[0]].up);
            container
                .append("text")
                .attr("fill", "#FFF1E8")
                .attr("x", 23)
                .attr("y", 43)
                .attr("text-anchor", "middle")
                .attr("font-size", 4)
                .attr("id", "down-" + element[0])
                .text("" + player.keybindings[element[0]].down);

            container
                .append("text")
                .attr("fill", "#FFF1E8")
                .attr("x", 5)
                .attr("y", 23)
                .attr("text-anchor", "middle")
                .attr("font-size", 4)
                .attr("id", "up-" + element[1])
                .text("" + player.keybindings[element[1]].up);
            container
                .append("text")
                .attr("fill", "#FFF1E8")
                .attr("x", 41)
                .attr("y", 23)
                .attr("text-anchor", "middle")
                .attr("font-size", 4)
                .attr("id", "down-" + element[1])
                .text("" + player.keybindings[element[1]].down);
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
}



remake()
init(blocks)

const stats = d3.select(".stats").append("svg")
    .attr("viewBox", "0 0 40 40")

const player_1_score = stats.append("text")
    .attr("x", 3)
    .attr("y", 12)
    .attr("text-anchor", "middle")
    .attr("font-size", 4)
    .attr("fill", "#FF004D")
    .text(0)
const player_2_score = stats.append("text")
    .attr("x", 37)
    .attr("y", 12)
    .attr("text-anchor", "middle")
    .attr("font-size", 4)
    .attr("fill", "#FFA300")
    .text(0)

function update_board() {
    blocks = generate_blocks()
    for (const name of Object.keys(players)) {
        const player = players[name]
        for (const element of player.snake) {
            blocks.get(element)[0]["player"] = [name, false]
        }
        if (player.snake.length > 0) {
            blocks.get(player.snake[player.snake.length - 1])[0]["player"] = [name, true]
        }
    }
    blocks.get(goal)[0]["goal"] = true
}

function draw() {

    update_board()
    init(blocks)
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
                        if (d.info.player[1]) {
                            return players[d.info.player[0]].main_colour
                        } else {
                            return players[d.info.player[0]].secondary_colour
                        }
                    } else {
                        return "#FFF1E8"
                    };
                });

        }
    }
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
    goal = get_empty_coord()
    for (const name of Object.keys(players)) {
        const player = players[name]
        player.snake = [get_empty_coord()]
        update_board()
        player["direction"] = [0, 0, 0]
    }
    draw()
}
reset()

d3.select('#dimensions')
    .on("change", function () {
        let value = document.getElementById("dimensions").selectedIndex + 2;
        dimensions = value
        // HACK
        remake()
        reset()
        remake()
        reset()
    });

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
        goal = get_empty_coord()
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
        let direction = new Array(dimensions).fill(0)
        let clicked = false;
        let id;
        for (let a = 0; a < dimensions; a++) {
            if (event.key == player.keybindings[a].up) {
                id = "#up-" + a
                clicked = true
                direction[a] = -1;
                break;
            } else if (event.key == player.keybindings[a].down) {
                id = "#down-" + a
                clicked = true
                direction[a] = 1;
                break;
            }
        }
        if (clicked) {
            d3.select("." + name).selectAll("text").attr("fill", "#FFF1E8")
            d3.select("." + name).selectAll(id).attr("fill", player.main_colour)
            player.input = true
            player.direction = direction
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
            d3.select("." + name).selectAll("text").attr("fill", "#FFF1E8")
            players[name].input = false
        }
        step()
    }
}, false);