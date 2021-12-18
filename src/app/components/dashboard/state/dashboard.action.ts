export class SetUserData {
    static readonly type = '[User] Set User data by logged in';

    constructor(public user: any) {
    }
}