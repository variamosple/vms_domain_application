const { Graph } = require("./graph");

const wildCardStart = '[';
const wildCardEnd = ']';

class GraphSecret {
  constructor(secretGraph) {
    this.secretGraph = secretGraph;
    this.graph = this.loadGraph();
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

  getSecretParts(initialNodes, description) {
    let graph = this.graph;
    if (description.includes("choose")) {
      let jjj = 0;
    }
    let words = this.normalizeWords(description);
    let coincidentPaths = [];
    for (let i = 0; i < initialNodes.length; i++) {
      const initialNode = initialNodes[i];
      let token = this.getTokenFromNode(initialNode);
      if (token == words[0]) {
        const paths = graph.findAllPaths(initialNode);
        for (let p = 0; p < paths.length; p++) {
          console.log(p);
          if (p == 66) {
            let x = 0;
          }
          const path = paths[p];
          let candidateParts = this.checkPath(path, words);
          if (candidateParts != null) {
            coincidentPaths.push(candidateParts);
          }
        }
      }
    }
    if (coincidentPaths.length > 0) {
      let p = 0;
      let maxL = 0;
      for (let c = 0; c < coincidentPaths.length; c++) {
        const coincidentPath = coincidentPaths[c];
        let l = this.countElements(coincidentPath);
        if (maxL < l) {
          maxL = l;
          p = c;
        }
      }
      return coincidentPaths[p];
    }
    return null;
  }

  countElements(obj) {
    let count = 0;
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        count++;
      }
    }
    return count;
  }

  checkPath(path, words) {
    this.showPath(path);
    let tokenCount = 0;
    for (let t = 0; t < path.length; t++) {
      let index = path[t];
      let token = this.getTokenFromNode(index);
      if (token != "//") {
        tokenCount++;
      }
    }
    let tokenCoincidences = [];
    let parts = null;
    let candidateParts = [];
    let w = 0;
    let wildCard = -1;
    let t = 0;
    for (let w = 0; w < words.length; w++) {
      const word = words[w];
      let index = null;
      let token = null;
      let tag = null;
      while (true) {
        index = path[t];
        tag = this.getTagFromNode(index);
        token = this.getTokenFromNode(index);
        if (token != "//") {
          break;
        } else {
          if (!tokenCoincidences.includes(index)) {
            tokenCoincidences.push(index);
          }
        }
        if (t < path.length - 1) {
          t++;
        } else {
          if (t == wildCard) {
            return null;
          }
        }
      }

      if (token == word) {
        let item = {
          word: word,
          key: token,
          tag: tag + '_' + token,
          id: index
        }
        candidateParts['_' + index] = item;
        wildCard = -1;
        if (!tokenCoincidences.includes(index)) {
          tokenCoincidences.push(index);
        }
        t++;
      } else {
        if (token.startsWith(wildCardStart)) {
          if (!candidateParts['_' + index]) {
            let item = {
              word: word,
              key: token,
              tag: tag + '_' + token,
              id: index
            }
            candidateParts['_' + index] = item;
          } else {
            candidateParts['_' + index].word = candidateParts['_' + index].word + ' ' + word;
          }
          wildCard = t;
          if (!tokenCoincidences.includes(index)) {
            tokenCoincidences.push(index);
          }
          t++;
        }
        else {
          if (wildCard > -1) {
            t = wildCard;
            wildCard = -1;
            w--;
          } else {
            // t++;
            return null;
          }
        }
      }
      if (w == words.length - 1) {
        if (path.length == tokenCoincidences.length) {
          for (let t = 0; t < path.length; t++) {
            if (path[t] != tokenCoincidences[t]) {
              return null;
            }
          }
          return candidateParts;
        }
      }
    }
    return null;
  }

  showPath(path) {
    let words = [];
    for (let j = 0; j < path.length; j++) {
      const id = path[j];
      let name = this.secretGraph.nodes[id].name;
      if (name != "//") {
        words.push(name);
      }
    }
    console.log(words.join(' '));
  }

  static showPaths(graph) {
    const startNode = 0;
    const paths = graph.findAllPaths(startNode);
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      let words = [];
      for (let j = 0; j < path.length; j++) {
        const id = path[j];
        let name = this.secretGraph.nodes[id].name;
        if (name != "//") {
          words.push(name);
        }
      }
      console.log(words.join(' '));
    }
  }

  normalizeWords(text) {
    let str = text.toLowerCase();
    if (!str.endsWith(".")) {
      str += ".";
    }
    str = str.replace(/\./g, ' . ');
    str = str.replace(/\(/g, ' ( ');
    str = str.replace(/\)/g, ' ) ');
    str = str.replace(/\r/g, '');
    str = str.replace(/\n/g, '');
    str = str.trim();
    while (str.includes('  ')) {
      str = this.replaceDoubleSpacesWithSingle(str);
    }

    let tokens = str.split(' ');
    return tokens;
  }

  replaceDoubleSpacesWithSingle(inputString) {
    return inputString.replace(/ {2}/g, ' ');
  }

  getTokenFromNode(id) {
    let word = this.secretGraph.nodes[id].name;
    return word;
  }

  getTagFromNode(id) {
    let tag = this.secretGraph.nodes[id].tag;
    return tag;
  }
}

//export methods
module.exports = { GraphSecret };