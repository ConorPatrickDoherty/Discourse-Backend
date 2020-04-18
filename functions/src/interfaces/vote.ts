export interface Vote {
    parentId :string,
    user: string,
    value: VoteValue
}

declare type VoteValue = -1 | 0 | 1