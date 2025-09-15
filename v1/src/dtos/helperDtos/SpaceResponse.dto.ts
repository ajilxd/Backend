import { Expose, Transform, Type } from "class-transformer";

class Member {
  @Expose()
  userId!: string;

  @Expose()
  designation!: string;

  @Expose()
  @Transform(({ value }) =>
    value instanceof Date ? value.toDateString() : value
  )
  joinedAt!: string;
}

class Team {
  @Expose()
  @Type(() => Member)
  members!: Member;
}

class Manager {
  @Expose()
  managerId!: string;

  @Expose()
  managerImage!: string;

  @Expose()
  managerName!: string;

  @Expose()
  status!: string;
}

export class SpaceResponse {
  @Expose()
  name!: string;

  @Expose()
  description!: string;

  @Expose()
  status!: string;

  @Expose()
  tags!: string[];

  @Expose()
  @Type(() => Team)
  team!: Team;

  @Expose()
  @Type(() => Manager)
  managers!: Manager[];
}
