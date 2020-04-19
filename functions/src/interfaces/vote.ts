export interface Vote {
    parentId? :string,
    user?: string,
    value: VoteValue
}

export declare type VoteValue = -1 | 0 | 1