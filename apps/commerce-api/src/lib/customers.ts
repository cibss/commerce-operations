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

const seedCustomers: Customer[] = [
  {
    id: "CUST-0192",
    companyName: "PT Nusantara Teknologi",
    contactName: "Andi Pratama",
    email: "andi@nusantarateknologi.co.id",
    phone: "+62 21 555 0192",
    segment: "ENTERPRISE",
    status: "ACTIVE",
    createdAt: "2026-01-14T03:00:00.000Z",
    updatedAt: "2026-08-20T04:30:00.000Z",
  },
  {
    id: "CUST-0188",
    companyName: "PT Sinar Digital Indonesia",
    contactName: "Maya Putri",
    email: "maya@sinardigital.co.id",
    phone: "+62 21 555 0188",
    segment: "MID_MARKET",
    status: "ACTIVE",
    createdAt: "2026-02-08T02:00:00.000Z",
    updatedAt: "2026-08-18T06:00:00.000Z",
  },
  {
    id: "CUST-0179",
    companyName: "PT Aruna Commerce",
    contactName: "Dimas Santoso",
    email: "dimas@arunacommerce.co.id",
    phone: "+62 21 555 0179",
    segment: "MID_MARKET",
    status: "ACTIVE",
    createdAt: "2026-03-11T05:00:00.000Z",
    updatedAt: "2026-08-14T01:30:00.000Z",
  },
  {
    id: "CUST-0175",
    companyName: "PT Meridian Digital",
    contactName: "Nadia Wijaya",
    email: "nadia@meridiandigital.co.id",
    phone: "+62 21 555 0175",
    segment: "ENTERPRISE",
    status: "ACTIVE",
    createdAt: "2026-03-20T02:30:00.000Z",
    updatedAt: "2026-08-15T03:00:00.000Z",
  },
  {
    id: "CUST-0168",
    companyName: "PT Atlas Retail Indonesia",
    contactName: "Raka Mahendra",
    email: "raka@atlasretail.co.id",
    phone: "+62 21 555 0168",
    segment: "ENTERPRISE",
    status: "ACTIVE",
    createdAt: "2026-04-02T04:00:00.000Z",
    updatedAt: "2026-08-12T02:00:00.000Z",
  },
  {
    id: "CUST-0152",
    companyName: "PT Garuda Solusi",
    contactName: "Sinta Rahma",
    email: "sinta@garudasolusi.co.id",
    phone: "+62 21 555 0152",
    segment: "SMB",
    status: "ACTIVE",
    createdAt: "2026-04-18T03:00:00.000Z",
    updatedAt: "2026-08-09T04:00:00.000Z",
  },
];

const customers = new Map<string, Customer>(
  seedCustomers.map((customer) => [customer.id, customer]),
);

function cloneCustomer(customer: Customer): Customer {
  return structuredClone(customer);
}

function getCustomerOrThrow(id: string): Customer {
  const customer = customers.get(id);

  if (!customer) {
    throw new CustomerDomainError(`Customer ${id} was not found.`, 404);
  }

  return customer;
}

export function listCustomers(): Customer[] {
  return Array.from(customers.values())
    .sort((a, b) => a.companyName.localeCompare(b.companyName))
    .map(cloneCustomer);
}

export function getCustomer(id: string): Customer {
  return cloneCustomer(getCustomerOrThrow(id));
}
