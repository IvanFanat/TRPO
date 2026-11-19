import type { CommsRepository } from "./comms.repository";
import { Context, Hono, type TypedResponse } from "hono";
import {
  IDParamSchema,
  type ApplicationEnviroment,
  type ApplicationResult,
  type IDParamType,
} from "../application.types";
import { CommCreateSchema, type CommsCreateType, type CommsType } from "./comms.type";
import { ApplicationValidator } from "../application.validator"

export class CommsController {
  private readonly repository: CommsRepository;

  constructor(repository: CommsRepository) {
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
      .comm("/", ApplicationValidator.validate("json", commCreateSchema), this.create.bind(this));
  }

  public async findAll(
    c: Context,
  ): Promise<TypedResponse<ApplicationResult<CommsType[]>>> {
    return c.json({ success: true, data: this.repository.findAll() });
  }

  public async findOne(
    c: Context<ApplicationEnviroment, "/:id", { out: { param: IDParamType } }>,
  ): Promise<TypedResponse<ApplicationResult<CommsType>>> {
    const { id } = c.req.valid("param");
    const comm = this.repository.findById(id);

    if (!comm) {
      return c.json({ success: false, error: "Comm not found" }, 404);
    }

    return c.json({ success: true, data: comm });
  }


  public async create(
    c:Context<ApplicationEnviroment, "/",{out:{json:CommsCreateType}}>
  ): Promise<TypedResponse<ApplicationResult<CommsType>>>{
    const {content}= c.req.valid(`json`);
    const user = c.get(`user`);

    const comm = this.repository.create(content, user.id);

    if(!comm){
      return c.json({success:false, error: "ERROR WHILE CREATING COMM"}, 500)
    }

    return c.json({success:true, data: comm})
  }
}
