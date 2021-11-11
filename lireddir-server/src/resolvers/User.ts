import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { MyContext } from "src/types";
import { User } from "../entities/User";
import argon2 from "argon2";

declare module "express-session" {
  interface Session {
    userId: number;
  }
}

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => User, {nullable: true})
  user?: User;

  @Field(() => [FieldError], {nullable: true})
  errors?: FieldError[]
}

@Resolver()
export class UserResolver {
  @Query(() => User, {nullable: true})
  async me(
    @Ctx() { em, req }: MyContext
  ): Promise<User | null> {
    // not logged in
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, {id: req.session.userId})
    return user;
  }

  @Query(() => [User])
  users(
    @Ctx() { em }: MyContext
  ): Promise<User[]> {
    return em.find(User, {})
  }

  // @Query(() => User, { nullable: true })
  // user(
  //   @Arg('id') id: number,
  //   @Ctx() { em }: MyContext
  // ): Promise<User | null> {
  //   return em.findOne(User, { id });
  // }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [{
          field: 'username',
          message: 'length must be greater than 2'
        }]
      }
    }

    if (options.password.length <= 3) {
      return {
        errors: [{
          field: 'password',
          message: 'length must be greater thant 3'
        }]
      }
    }

    const hashedPwd = await argon2.hash(options.password)
    const user = em.create(User, {username: options.username, password: hashedPwd});

    try {
      await em.persistAndFlush(user);
    }
    catch (err) {
      if (err.code === '23505') {
        return {
          errors: [{
            field: 'username',
            message: 'already exists'
          }]
        }
      }
    }

    req.session!.userId = user.id;
    
    return { user };
  }

  @Mutation(() => UserResponse, { nullable: true })
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {username: options.username});
    if (!user) {
      return {
        errors: [{
          field: 'username',
          message: 'could not find user with that username'
        }]
      }
    }

    const verified = await argon2.verify(user.password, options.password);
    if (!verified) {
      return {
        errors: [{
          field: 'password',
          message: 'password did not match'
        }]
      }
    }

    req.session!.userId = user.id;

    await em.persistAndFlush(user);
    return { user };
  }

  // @Mutation(() => Post, { nullable: true })
  // async updatePost(
  //   @Arg('id') id: number,
  //   @Arg('title') title: string,
  //   @Ctx() { em }: MyContext
  // ): Promise<Post | null> {
  //   const post = await em.findOne(Post, { id })
  //   if (!post) {
  //     return null;
  //   }

  //   if (typeof title !== 'undefined') {
  //     post.title = title;
  //     await em.persistAndFlush(post);
  //   }
  //   return post;
  // }

  // @Mutation(() => Boolean)
  // async deletePost(
  //   @Arg('id') id: number,
  //   @Ctx() { em }: MyContext
  // ): Promise<Boolean> {
  //   em.nativeDelete(Post, { id })
  //   return true;
  // }
}