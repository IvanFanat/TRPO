import type { PostsRepository } from "./posts.repository";
import { Context, Hono, type TypedResponse } from "hono";
import {
  IDParamSchema,
  type ApplicationEnviroment,
  type ApplicationResult,
  type IDParamType,
} from "../application.types";
import { postCreateSchema, type PostsCreateType, type PostsType } from "./posts.type";
import { ApplicationValidator } from "../application.validator"

export class PostsController {
  private readonly repository: PostsRepository;

  constructor(repository: PostsRepository) {
    this.repository = repository;
  }

  public routes(): Hono {
    return new Hono()
      .get("/", this.findAll.bind(this))
      .get(
        "/:id",
        ApplicationValidator.validate("param", IDParamSchema),
        this.findOne.bind(this),
      )
      .post("/", ApplicationValidator.validate("json", postCreateSchema), this.create.bind(this));
  }

  public async findAll(
    c: Context,
  ): Promise<TypedResponse<ApplicationResult<PostsType[]>>> {
    return c.json({ success: true, data: this.repository.findAll() });
  }

  public async findOne(
    c: Context<ApplicationEnviroment, "/:id", { out: { param: IDParamType } }>,
  ): Promise<TypedResponse<ApplicationResult<PostsType>>> {
    const { id } = c.req.valid("param");
    const post = this.repository.findById(id);

    if (!post) {
      return c.json({ success: false, error: "Post not found" }, 404);
    }

    return c.json({ success: true, data: post });
  }


  public async create(
    c:Context<ApplicationEnviroment, "/",{out:{json:PostsCreateType}}>
  ): Promise<TypedResponse<ApplicationResult<PostsType>>>{
    const {content}= c.req.valid(`json`);
    const user = c.get(`user`);

    const post = this.repository.create(content, user.id);

    if(!post){
      return c.json({success:false, error: "ERROR WHILE CREATING POST"}, 500)
    }

    return c.json({success:true, data: post})
  }
}
