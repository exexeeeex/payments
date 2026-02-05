import { EntityManager, QueryRunner } from "typeorm";
import { Request as ExpressRequest } from "express";

export interface CustomRequest extends ExpressRequest {
	transactionManager?: EntityManager;
	queryRunner?: QueryRunner;
}
