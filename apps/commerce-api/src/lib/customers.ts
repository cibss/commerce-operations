export type CustomerSegment = "ENTERPRISE" | "MID_MARKET" | "SMB";

export type CustomerStatus = "ACTIVE" | "INACTIVE";

export type Customer = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  segment: CustomerSegment;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
};

export class CustomerDomainError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);

    this.name = "CustomerDomainError";
    this.statusCode = statusCode;
  }
}
