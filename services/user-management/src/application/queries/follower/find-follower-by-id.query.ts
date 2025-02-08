import { FollowID } from "src/domain/value-objects/follower-id.value-object";

export class FindFollowerByIdQuery {
    constructor(public readonly followId: FollowID) { }
}
