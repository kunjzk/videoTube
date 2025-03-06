import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Without Async handler: inefficient
// const healthcheck = async (req, res) => {
//   try {
//     res.status(200).json();
//   } catch (error) {
//     res.status(error.status);
//     console.log(error);
//   }
// };

// Uses asyncHandler, which gaurantees a promise is sent, but no ApiResponse used
// const healthcheck = asyncHandler(async (req, res) => {
//   return res.status(200).json({ message: "test ok" });
// });

const healthcheck = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "OK", "Health check passed"));
});

export { healthcheck };
