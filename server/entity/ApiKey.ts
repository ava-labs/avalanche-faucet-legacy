import {Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany} from "typeorm";
import {Transaction} from "./Transaction";

@Entity()
export class ApiKey {
    @PrimaryGeneratedColumn()
    id!: number;
    @Column()
    name!: string;
    @Column()
    hash!: string;
    @Column({type: 'bigint'})
    daily_limit!: number;
    @OneToMany(() => Transaction, transaction => transaction.api_key)
    transactions!: Transaction
    @CreateDateColumn({type: 'timestamp'})
    createdAt!: string;
    @UpdateDateColumn({type: 'timestamp'})
    updatedAt!: string;
}
