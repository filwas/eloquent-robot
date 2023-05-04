var roads = [
    "Alice's House-Bob's House",   "Alice's House-Cabin",
    "Alice's House-Post Office",   "Bob's House-Town Hall",
    "Daria's House-Ernie's House", "Daria's House-Town Hall",
    "Ernie's House-Grete's House", "Grete's House-Farm",
    "Grete's House-Shop",          "Marketplace-Farm",
    "Marketplace-Post Office",     "Marketplace-Shop",
    "Marketplace-Town Hall",       "Shop-Town Hall"
  ];

function buildGraph(edges) {
    let graph= Object.create(null);

    function addEdge(from, to) {
        if(graph[from] == null) {
            graph[from] = [to];
        } else {
            graph[from].push(to);
        }
    }

    for (let [from, to] of edges.map(r => r.split(/-/))) {
        addEdge(from, to);
        addEdge(to, from);
    }

    return graph;
}

const roadGraph = buildGraph(roads);

class VillageState{
    constructor(place, parcels) {
        this.place = place;
        this.parcels = parcels;
    }

    move(destination) {
        if(!roadGraph[this.place].includes(destination)){
            return this;
        } else {
            let parcels = this.parcels.map(p => {
                if(p.place != this.place) return p;
                return {place: destination, address: p.address};
            }).filter(p => p.place != p.address);
            return new VillageState(destination, parcels)
        }
    }
}

function runRobot(state, robot, memory) {
    for (let turn = 0;; turn++) {
        if(state.parcels.length == 0){
            console.log(`Done in ${turn} turns`);
            break;
        }
        let action = robot(state, memory);
        state = state.move(action.direction);
        memory = action.memory;
        console.log(`Moved to ${action.direction}`);
    }
}

function randomPick(array) {
    let choice = Math.floor(Math.random() * array.length);
    return array[choice];
}

function randomRobot(state) {
    return {direction: randomPick(roadGraph[state.place])}
}

VillageState.random = function(parcelCount = 5) {
    let parcels = [];
    for (let i = 0; i < parcelCount; i++) {
        let address = randomPick(Object.keys(roadGraph));
        let place;
        do {
            place = randomPick(Object.keys(roadGraph));
        } while (place == address);
        parcels.push({place, address});
    }
    return new VillageState("Post Office", parcels);
}

let randomState = VillageState.random();

//runRobot(randomState, randomRobot)

var mailRoute = [
    "Alice's House", "Cabin", "Alice's House", "Bob's House",
    "Town Hall", "Daria's House", "Ernie's House",
    "Grete's House", "Shop", "Grete's House", "Farm",
    "Marketplace", "Post Office"
];

function routeRobot(state, memory = []) {
    if (memory.length == 0) {
        memory = mailRoute;
    }
    return {direction: memory[0], memory: memory.slice(1)};
}
  
//runRobot(randomState, routeRobot)

function findRoute(graph, from, to) {
    let work = [{at: from, route: []}];
    for (let i = 0; i < work.length; i++) {
      let {at, route} = work[i];
      for (let place of graph[at]) {
        if (place == to) return route.concat(place);
        if (!work.some(w => w.at == place)) {
          work.push({at: place, route: route.concat(place)});
        }
      }
    }
}



function goalOrientedRobot({place, parcels}, route = []) {
    if (route.length == 0) {
      let parcel = parcels[0];
      if (parcel.place != place) {
        route = findRoute(roadGraph, place, parcel.place);
      } else {
        route = findRoute(roadGraph, place, parcel.address);
      }
    }
    return {direction: route[0], memory: route.slice(1)};
}

//runRobot(randomState, goalOrientedRobot)


/*  
    This is the first function I've created for this exercise myself. The task is to generate 100 different scenarios,
    have two robots solve all of them and compare the average amount of steps it took to complete it. What I've
    noticed is that basicaly all I needed to do is to make the function runRobot return the steps number at the end,
    but I didn't want to change the original function. Therefore I've copy-pasted the original function, changed it's
    name and made it do what I want it to do. 
    The rest of the function is pretty straightforward. It generates an array and fills it with a hundred random states,
    and then calls the counting function for both robots for each state. Thanks to the fact that robots don't change
    the original states and create new ones as they go along, I don't need to make a deep copy of each starting state
    and can feed both robots same thing. It simply adds up all of the steps needed to complete all 100 starting states
    and divides it by 100 at the output.
*/
function compareRobots(robot1, memory1, robot2, memory2) {
    let states = []
    let robot1Moves = 0;
    let robot2Moves = 0;
    for (let i = 0; i < 100; i++) {
        states.push(VillageState.random());
    }    


    states.forEach(currentState => {
        robot1Moves += countRobot(currentState, robot1, memory1);
        robot2Moves += countRobot(currentState, robot2, memory2);
    });

    console.log(`Robot 1 finished in ${robot1Moves/100}, robot 2 in ${robot2Moves/100}`);
}

function countRobot(state, robot, memory) {
    for (let turn = 0;; turn++) {
        if(state.parcels.length == 0){
            return turn;
        }
        let action = robot(state, memory);
        state = state.move(action.direction);
        memory = action.memory;
    }
}
  
/*
    As a second exercise, I was supposed to make the goalOrientedRobot more efficient. The most obvious thing that I noticed 
    about the robot was that it went straight for the first parcel created by th VillageState.random() function, so simply I
    made the robot sort the parcels array so the nearest parcel is on the top of the list. The robot is faster by about 1.5
    steps, as per compareRobots function.
*/

function newRobot({place, parcels}, route = []) {
    if (route.length == 0) {
        parcels.sort((a, b) => findRoute(roadGraph, place, a.place).length - findRoute(roadGraph, place, b.place).length)

        let parcel = parcels[0];

        if (parcel.place != place) {
            route = findRoute(roadGraph, place, parcel.place);
        } else {
            route = findRoute(roadGraph, place, parcel.address);
        }
    }
    return {direction: route[0], memory: route.slice(1)};
}


compareRobots(newRobot, [], goalOrientedRobot, []);