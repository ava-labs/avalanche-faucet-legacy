import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {ApiKey} from "./ApiKey";

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
    id!: number;
    @Column()
    to!: string;
    @Column()
    amount!: number;
    @ManyToOne(() => ApiKey, api_key => api_key.transactions)
    api_key!: ApiKey;
    @CreateDateColumn({type: 'timestamp'})
    createdAt!: string;
}
