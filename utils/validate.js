import Joi from "joi";

const noteSchema = Joi.object({
  id: Joi.string().optional(), // Behövs vid uppdatering
  title: Joi.string().max(50).required(),
  text: Joi.string().max(300).required(),
  userId: Joi.string().optional(), // Skapas och används av backend
  createdAt: Joi.date().optional(), // Behövs inte vid validering
  modifiedAt: Joi.date().optional(), // Uppdateras av backend
});

export const validateNote = (data) => {
  if (!data.title || !data.text) {
    throw new Error("Title and text are required.");
  }
};

