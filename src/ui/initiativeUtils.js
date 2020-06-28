// @flow

import removeMd from "remove-markdown";
import {type TimestampMs} from "../util/timestamp";
import {type NodeAddressT} from "../core/graph";
import {type InitiativeWeight} from "../plugins/initiatives/initiative";
import {type NodeWeight} from "../core/weights";

// TODO: create formal initiative type once shape is defined (see github PR #1864)
export type InitiativeEntry = {|
  +id: string, // GUID
  +title: string,
  +timestampMs: TimestampMs,
  +weight: InitiativeWeight,
  +completed: boolean,
  // user nodes
  +champions: $ReadOnlyArray<NodeAddressT>,
  +dependencies: $ReadOnlyArray<NodeAddressT>,
  // an activity node
  +references: $ReadOnlyArray<NodeAddressT>,
  +contributions: $ReadOnlyArray<ContributionEntry>,
|};

type ContributionEntry = {|
  // GUID
  +key: string,
  // Title is required, as this is essential for attribution.
  +title: string,
  // Defaults to an empty array.
  +contributors: $ReadOnlyArray<NodeAddressT>,
  // Timestamp of this node, but in ISO format as it's more human friendly.
  +timestampMs: TimestampMs,
  // Defaults to null.
  +weight: NodeWeight,
|};

export const getPlainDescFromMd = ({description}: {description: string}) =>
  removeMd((description: string));

declare type DateString = string;

export const dateParser = (v: DateString): ?TimestampMs => {
  // v is a string of "YYYY-MM-DD" format
  const match = /(\d{4})-(\d{2})-(\d{2})/.exec(v);
  if (match === null) return;

  const d = new Date(
    parseInt(match[1], 10),
    parseInt(match[2], 10) - 1,
    parseInt(match[3], 10)
  );
  if (isNaN(d)) return;
  return Date.parse(d.toISOString());
};

export const dateFormatter = (t: TimestampMs): ?DateString => {
  // v is a `Date` object
  const v = new Date(t);
  if (!(v instanceof Date) || isNaN(v)) return;
  const pad = "00";
  const yy = v.getFullYear().toString();
  const mm = (v.getMonth() + 1).toString();
  const dd = v.getDate().toString();
  return `${yy}-${(pad + mm).slice(-2)}-${(pad + dd).slice(-2)}`;
};
