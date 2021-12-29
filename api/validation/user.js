import Joi from 'joi';

export function username(name) {
    const schema = Joi.string()
        .label('Nickname')
        .min(3)
        .max(20);
        return schema.validate(name);
}