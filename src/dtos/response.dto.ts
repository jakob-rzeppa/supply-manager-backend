export default interface ResponseDto<Data> {
  error?: string;
  message: string;
  data?: Data;
}
