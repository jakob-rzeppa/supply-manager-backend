import { Router, Request, Response, NextFunction } from "express";
import Joi from "joi";

import ResponseDto from "../dtos/response.dto";
import ProductDto from "../dtos/product.dto";
import validateRequest from "../validation/requestValidation";
import { catchPromiseError } from "../utilityFunctions/errorHandling";
import {
  createItemBodySchema,
  createProductBodySchema,
  eanSchema,
  updateProductBodySchema,
} from "../validation/productValidationSchemas";
import validateLocals from "../validation/localsValidation";
import { userSchema } from "../validation/userValidationSchemas";
import authMiddleware from "../middlewares/authMiddleware";
import productsService from "../services/productsService";

const productsRoutes = Router();

productsRoutes.use(authMiddleware);

productsRoutes.get(
  "",
  async (req: Request, res: Response, next: NextFunction) => {
    {
      const validationError = validateLocals(
        res,
        Joi.object({ user: userSchema })
      );
      if (validationError) return next(validationError);
    }

    const [error, productDtos] = await catchPromiseError(
      productsService.getProductsByUserId(res.locals.user.id)
    );
    if (error) return next(error);

    const responseBody: ResponseDto<ProductDto[]> = {
      message: "Products retrieved successfully",
      data: productDtos,
    };

    res.status(200).json(responseBody);
  }
);

productsRoutes.get(
  "/:ean",
  async (req: Request, res: Response, next: NextFunction) => {
    {
      const validationError = validateRequest(req, {
        params: new Map([["ean", eanSchema]]),
      });
      if (validationError) return next(validationError);
    }

    {
      const validationError = validateLocals(
        res,
        Joi.object({ user: userSchema })
      );
      if (validationError) return next(validationError);
    }

    const [error, productDto] = await catchPromiseError(
      productsService.getProductByEanAndUserId(
        req.params.ean,
        res.locals.user.id
      )
    );
    if (error) return next(error);

    const responseBody: ResponseDto<ProductDto> = {
      message: "Product retrieved successfully",
      data: productDto,
    };

    res.status(200).json(responseBody);
  }
);

productsRoutes.post(
  "",
  async (req: Request, res: Response, next: NextFunction) => {
    {
      const validationError = validateRequest(req, {
        body: createProductBodySchema,
      });
      if (validationError) return next(validationError);
    }

    {
      const validationError = validateLocals(
        res,
        Joi.object({ user: userSchema })
      );
      if (validationError) return next(validationError);
    }

    const [error, productDto] = await catchPromiseError(
      productsService.createProduct(res.locals.user.id, req.body)
    );
    if (error) return next(error);

    const responseBody: ResponseDto<ProductDto> = {
      message: "Product created succesfully",
      data: productDto,
    };

    res.status(201).json(responseBody);
  }
);

productsRoutes.put(
  "/:ean",
  async (req: Request, res: Response, next: NextFunction) => {
    {
      const validationError = validateRequest(req, {
        params: new Map([["ean", eanSchema]]),
        body: updateProductBodySchema,
      });
      if (validationError) return next(validationError);
    }

    {
      const validationError = validateLocals(
        res,
        Joi.object({ user: userSchema })
      );
      if (validationError) return next(validationError);
    }

    const [error, productDto] = await catchPromiseError(
      productsService.updateProduct(
        req.params.ean,
        res.locals.user.id,
        req.body
      )
    );
    if (error) return next(error);

    const responseBody: ResponseDto<ProductDto> = {
      message: "Product updated successfully",
      data: productDto,
    };

    res.status(200).json(responseBody);
  }
);

productsRoutes.delete(
  "/:ean",
  async (req: Request, res: Response, next: NextFunction) => {
    {
      const validationError = validateRequest(req, {
        params: new Map([["ean", eanSchema]]),
      });
      if (validationError) return next(validationError);
    }

    {
      const validationError = validateLocals(
        res,
        Joi.object({ user: userSchema })
      );
      if (validationError) return next(validationError);
    }

    const [error] = await catchPromiseError(
      productsService.deleteProductByEan(req.params.ean, res.locals.user.id)
    );
    if (error) return next(error);

    const responseBody: ResponseDto<null> = {
      message: "Product deleted successfully",
    };
    res.status(200).json(responseBody);
  }
);

productsRoutes.post(
  "/:ean/items",
  async (req: Request, res: Response, next: NextFunction) => {
    {
      const validationError = validateRequest(req, {
        params: new Map([["ean", eanSchema]]),
        body: createItemBodySchema,
      });
      if (validationError) return next(validationError);
    }
    {
      const validationError = validateLocals(
        res,
        Joi.object({ user: userSchema })
      );
      if (validationError) return next(validationError);
    }

    const [error, productDto] = await catchPromiseError(
      productsService.addProductItem(
        req.params.ean,
        res.locals.user.id,
        req.body
      )
    );
    if (error) return next(error);

    const responseBody: ResponseDto<ProductDto> = {
      message: "Item added successfully",
      data: productDto,
    };

    res.status(200).json(responseBody);
  }
);

productsRoutes.put(
  "/:ean/items/:index",
  async (req: Request, res: Response, next: NextFunction) => {
    {
      const validationError = validateRequest(req, {
        params: new Map([
          ["ean", eanSchema],
          ["index", Joi.string().regex(/^\d+$/).required()],
        ]),
        body: createItemBodySchema,
      });
      if (validationError) return next(validationError);
    }
    {
      const validationError = validateLocals(
        res,
        Joi.object({ user: userSchema })
      );
      if (validationError) return next(validationError);
    }

    const [error, updatedProductDto] = await catchPromiseError(
      productsService.updateProductItem(
        req.params.ean,
        res.locals.user.id,
        parseInt(req.params.index),
        req.body
      )
    );
    if (error) return next(error);

    const responseBody: ResponseDto<ProductDto> = {
      message: "Item updated successfully",
      data: updatedProductDto,
    };

    res.status(200).json(responseBody);
  }
);

productsRoutes.delete(
  "/:ean/items/:index",
  async (req: Request, res: Response, next: NextFunction) => {
    {
      const validationError = validateRequest(req, {
        params: new Map([
          ["ean", eanSchema],
          ["index", Joi.string().regex(/^\d+$/).required()],
        ]),
      });
      if (validationError) return next(validationError);
    }
    {
      const validationError = validateLocals(
        res,
        Joi.object({ user: userSchema })
      );
      if (validationError) return next(validationError);
    }

    const [error] = await catchPromiseError(
      productsService.deleteProductItem(
        req.params.ean,
        res.locals.user.id,
        parseInt(req.params.index)
      )
    );
    if (error) return next(error);

    const responseBody: ResponseDto<null> = {
      message: "Item deleted successfully",
    };

    res.status(200).json(responseBody);
  }
);

export default productsRoutes;
