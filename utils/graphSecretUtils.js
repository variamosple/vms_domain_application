const { Graph } = require("./graph");

class GraphSecretUtils {

  static loadGraph(secretGraph) {
    let graph = new Graph();
    if (true) {
      let dic = [];
      for (let i = 0; i < secretGraph.nodes.length; i++) {
        const node = secretGraph.nodes[i];
        graph.addVertex(i);
        dic[node.id] = i;
      }
      for (let i = 0; i < secretGraph.edges.length; i++) {
        const edge = secretGraph.edges[i];
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
module.exports = { GraphSecretUtils };