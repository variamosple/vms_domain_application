const { Graph } = require("./graph");

class GraphSecret  {
    constructor(secretGraph) {
        this.secretGraph=secretGraph;
        this.graph=this.loadGraph();
    }

   loadGraph() {
    let graph = new Graph();
    if (true) {
      let dic = [];
      for (let i = 0; i < this.secretGraph.nodes.length; i++) {
        const node = this.secretGraph.nodes[i];
        graph.addVertex(i);
        dic[node.id] = i;
      }
      for (let i = 0; i < this.secretGraph.edges.length; i++) {
        const edge = this.secretGraph.edges[i];
        let sourceId = dic[edge.sourceNodeId];
        let targetId = dic[edge.targetNodeId];
        graph.addEdge(sourceId, targetId);
      }
    } else {
      graph.addVertex('A');
      graph.addVertex('B');
      graph.addVertex('C');
      graph.addVertex('D');

      graph.addEdge('A', 'B');
      graph.addEdge('A', 'C');
      graph.addEdge('B', 'D');
      graph.addEdge('C', 'D');
    }
    return graph;
  }

  static showPaths(graph) {
    const startNode = 0;
    const paths = graph.findAllPaths(startNode);
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      let words = [];
      for (let j = 0; j < path.length; j++) {
        const id = path[j];
        let name = secretGraph.nodes[id].name;
        if (name != "//") {
          words.push(name);
        }
      }
      console.log(words.join(' '));
    }
  }
}

//export methods
module.exports = { GraphSecret };