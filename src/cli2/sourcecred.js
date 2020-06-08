// @flow

import type {Command} from "./command";

import load from "./load";
import graph from "./graph";
import merge from "./merge";
import score from "./score";
import credrank from "./credrank";

const sourcecred: Command = async (args, std) => {
  if (args.length === 0) {
    std.err("fatal: specify a command");
    return 1;
  }
  switch (args[0]) {
    case "load":
      return load(args.slice(1), std);
    case "graph":
      return graph(args.slice(1), std);
    case "merge":
      return merge(args.slice(1), std);
    case "score":
      return score(args.slice(1), std);
    case "credrank":
      return credrank(args.slice(1), std);
    default:
      std.err("fatal: unknown command: " + JSON.stringify(args[0]));
      return 1;
  }
};

export default sourcecred;
