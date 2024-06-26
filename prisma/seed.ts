import { PrismaClient, Role } from "@prisma/client";
import slugify from "slugify";
import { QuantityUnit } from "~/quantity-units";
import { createPasswordHash } from "~/utils/misc.server";

const db = new PrismaClient();

async function seed() {
  await db.user.deleteMany();
  await db.admin.deleteMany();
  await db.product.deleteMany();
  await db.productOrder.deleteMany();
  await db.order.deleteMany();
  await db.category.deleteMany();
  await db.payment.deleteMany();

  await db.user.createMany({
    data: [
      {
        firstName: "John",
        lastName: "Doe",
        email: "user@app.com",
        password: await createPasswordHash("password"),
        role: Role.CUSTOMER,
        phoneNo: "1234567890",
        address: "123 Main St",
        dob: new Date("1990-01-01"),
        city: "New York",
        state: "NY",
        zipcode: "10001",
      },
      {
        firstName: "Jane",
        lastName: "Doe",
        email: "admin@app.com",
        password: await createPasswordHash("password"),
        role: Role.ADMIN,
        phoneNo: "1234567890",
        address: "123 admin St",
        dob: new Date("1990-02-02"),
        city: "Los Angeles",
        state: "CA",
        zipcode: "10002",
      },
    ],
  });

  await db.admin.create({
    data: {
      firstName: "Roxanna",
      lastName: "Doe",
      email: "admin@app.com",
      password: await createPasswordHash("password"),
      phoneNo: "1234567890",
      address: "123 Main St",
      dob: new Date("1990-03-05"),
      city: "San Francisco",
      state: "CA",
      zipcode: "10004",
    },
  });

  for (const category of categories) {
    await db.category.create({
      data: {
        name: category.name,
      },
    });
  }

  for (const product of products) {
    const category = await db.category.findUnique({
      where: {
        name: product.category[0],
      },
    });

    await db.product.create({
      data: {
        name: product.name,
        barcodeId: product.barcodeId,
        description: product.description,
        price: product.price,
        image: product.image,
        slug: slugify(product.name, { lower: true }),
        quantity: product.quantity,
        categoryId: category!.id,
        quantityUnit: product.quantityUnit,
      },
    });
  }

  console.log("Database has been seeded. 🌱");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

const products = [
  {
    name: "Brinjals",
    barcodeId: "1234",
    description:
      "Brinjal is a tropical and subtropical plant that prefers a warm and humid climate. It is a tender perennial, grown as an annual vegetable crop in temperate climates. The plant is erect, with a single stem that grows to a height of 1-3 m (3-10 ft).",
    image:
      "https://images.unsplash.com/photo-1617692913859-e492ea72afb7?auto=format&fit=crop&w=1170&q=80",
    quantity: 10,
    price: 11.99,
    category: ["Vegetables"],
    quantityUnit: QuantityUnit.Lb,
  },
  {
    name: "Cabbage",
    barcodeId: "44566",
    description:
      "Cabbage is a leafy green, red, or white biennial plant, grown as an annual vegetable crop for its dense-leaved heads. It is descended from the wild cabbage, B. oleracea, and belongs to the same species as broccoli and cauliflower.",
    image:
      "https://images.unsplash.com/photo-1598030343246-eec71cb44231?auto=format&fit=crop&w=1074&q=80",
    quantity: 10,
    price: 7.99,
    category: ["Vegetables"],
    quantityUnit: QuantityUnit.Lb,
  },
  {
    name: "Carrots",
    barcodeId: "0382",
    description:
      "The carrot is a root vegetable, typically orange in color, though purple, black, red, white, and yellow cultivars exist. Carrots are a domesticated form of the wild carrot, Daucus carota, native to Europe and Southwestern Asia.",
    image:
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2Fycm90c3xlbnwwfHwwfHx8MA%3D%3D",
    quantity: 10,
    price: 9.99,
    category: ["Vegetables"],
    quantityUnit: QuantityUnit.Lb,
  },
  {
    name: "Potatoes",
    barcodeId: "738293829",
    description:
      "The potato is a root vegetable native to the Americas, a starchy tuber of the plant Solanum tuberosum, and the plant itself, a perennial in the family Solanaceae.",
    image:
      "https://images.unsplash.com/photo-1508313880080-c4bef0730395?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cG90YXRvZXN8ZW58MHx8MHx8fDA%3D",
    quantity: 10,
    price: 5.99,
    category: ["Vegetables"],
    quantityUnit: QuantityUnit.Lb,
  },
  {
    name: "Tomatoes",
    barcodeId: "12712182",
    description:
      "The tomato is the edible berry of the plant Solanum lycopersicum, commonly known as a tomato plant. The species originated in western South America and Central America.",
    image:
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8dG9tYXRvZXN8ZW58MHx8MHx8fDA%3D",
    quantity: 10,
    price: 6.99,
    category: ["Vegetables"],
    quantityUnit: QuantityUnit.Lb,
  },
  {
    name: "Milk",
    barcodeId: "9876",
    description:
      "Milk is a nutrient-rich liquid food produced by the mammary glands of mammals. It is the primary source of nutrition for young mammals, including breastfed human infants before they are able to digest solid food.",
    image:
      "https://images.unsplash.com/photo-1634141510639-d691d86f47be?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fE1pbGt8ZW58MHx8MHx8fDA%3D",
    quantity: 10,
    price: 3.99,
    category: ["Dairy"],
    quantityUnit: QuantityUnit.Oz,
  },
  {
    name: "Cheese",
    barcodeId: "8765",
    description:
      "Cheese is a dairy product, derived from milk and produced in wide ranges of flavors, textures, and forms by coagulation of the milk protein casein. It comprises proteins and fat from milk, usually the milk of cows, buffalo, goats, or sheep.",
    image:
      "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fENoZWVzZXxlbnwwfHwwfHx8MA%3D%3D",
    quantity: 10,
    price: 6.99,
    category: ["Dairy"],
    quantityUnit: QuantityUnit.Lb,
  },
  {
    name: "Yogurt",
    barcodeId: "2891021",
    description:
      "Yogurt, yoghurt, or yoghourt is a food produced by bacterial fermentation of milk. The bacteria used to make yogurt are known as yogurt cultures. Fermentation of sugars in the milk by these bacteria produces lactic acid, which acts on milk protein to give yogurt its texture and characteristic tart flavor.",
    image:
      "https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8eW9ndXJ0fGVufDB8fDB8fHww",
    quantity: 10,
    price: 4.99,
    category: ["Dairy"],
    quantityUnit: QuantityUnit.G,
  },
  {
    name: "Butter",
    barcodeId: "12198",
    description:
      "Butter is a dairy product made from the fat and protein components of milk or cream. It is a semi-solid emulsion at room temperature, consisting of approximately 80% butterfat. It is used at room temperature as a spread, melted as a condiment, and used as an ingredient in baking, sauce making, pan frying, and other cooking procedures.",
    image:
      "https://images.unsplash.com/photo-1620567838034-f32ee85818aa?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YnV0dGVyfGVufDB8fDB8fHww",
    quantity: 10,
    price: 5.99,
    category: ["Dairy"],
    quantityUnit: QuantityUnit.Oz,
  },
  {
    name: "Eggs",
    barcodeId: "5432",
    description:
      "Eggs are very healthy and contain many nutrients that are important for health. They are a popular food choice for many people. Eggs are a good source of protein and contain many vitamins and minerals.",
    image:
      "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZWdnc3xlbnwwfHwwfHx8MA%3D%3D",
    quantity: 10,
    price: 2.99,
    category: ["Dairy"],
    quantityUnit: QuantityUnit.PCS,
  },
  {
    name: "Apples",
    barcodeId: "3456",
    description:
      "The apple tree is a deciduous tree in the rose family best known for its sweet, pomaceous fruit, the apple. It is cultivated worldwide as a fruit tree and is the most widely grown species in the genus Malus.",
    image:
      "https://images.unsplash.com/photo-1630563451961-ac2ff27616ab?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fEFwcGxlc3xlbnwwfHwwfHx8MA%3D%3D",
    quantity: 10,
    price: 5.99,
    category: ["Fruits"],
    quantityUnit: QuantityUnit.Lb,
  },
  {
    name: "Bananas",
    barcodeId: "2345",
    description:
      "A banana is an elongated, edible fruit produced by several kinds of large herbaceous flowering plants in the genus Musa. The fruit is variable in size, color, and firmness, but is usually elongated and curved, with soft flesh rich in starch covered with a rind, which may be green, yellow, red, purple, or brown when ripe.",
    image:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8QmFuYW5hc3xlbnwwfHwwfHx8MA%3D%3D",
    quantity: 10,
    price: 3.99,
    category: ["Fruits"],
    quantityUnit: QuantityUnit.Lb,
  },
  {
    name: "Oranges",
    barcodeId: "3829932",
    description:
      "The orange is the fruit of various citrus species in the family Rutaceae; it primarily refers to Citrus sinensis, which is also called sweet orange, to distinguish it from the related Citrus aurantium, referred to as bitter orange.",
    image:
      "https://images.unsplash.com/photo-1547514701-42782101795e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8T3Jhbmdlc3xlbnwwfHwwfHx8MA%3D%3D",
    quantity: 10,
    price: 4.99,
    category: ["Fruits"],
    quantityUnit: QuantityUnit.Lb,
  },
  {
    name: "Pineapple",
    barcodeId: "328903209",
    description:
      "Pineapple is a tropical plant with an edible fruit and the most economically significant plant in the family Bromeliaceae. Pineapples may be cultivated from a crown cutting of the fruit, possibly flowering in 20-24 months and fruiting in the following six months.",
    image:
      "https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGluZWFwcGxlfGVufDB8fDB8fHww",
    quantity: 10,
    price: 6.99,
    category: ["Fruits"],
    quantityUnit: QuantityUnit.PCS,
  },
  {
    name: "Grapes",
    barcodeId: "829190",
    description:
      "A grape is a fruit, botanically a berry, of the deciduous woody vines of the flowering plant genus Vitis. Grapes can be eaten fresh as table grapes or they can be used for making wine, jam, grape juice, jelly, grape seed extract, raisins, vinegar, and grape seed oil.",
    image:
      "https://images.unsplash.com/photo-1596363505729-4190a9506133?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z3JhcGVzfGVufDB8fDB8fHww",
    quantity: 10,
    price: 7.99,
    category: ["Fruits"],
    quantityUnit: QuantityUnit.Lb,
  },
];

const categories = [
  {
    name: "Vegetables",
  },
  {
    name: "Fruits",
  },
  {
    name: "Dairy",
  },
  {
    name: "Beverages",
  },
  {
    name: "Bakery",
  },
  {
    name: "Meat",
  },
  {
    name: "Seafood",
  },
  {
    name: "Pantry",
  },
  {
    name: "Frozen",
  },
  {
    name: "Personal Care",
  },
  {
    name: "Household",
  },
  {
    name: "Baby",
  },
  {
    name: "Pets",
  },
];
