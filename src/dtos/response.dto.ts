export default interface ResponseDto<Data = undefined> {
  error?: string;
  message: string;
  data?: Data;
}
