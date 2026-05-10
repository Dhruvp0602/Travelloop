import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    // Verify ownership
    const trip = await prisma.trip.findUnique({ where: { id, userId: user.id } });
    if (!trip) return new NextResponse("Trip not found", { status: 404 });

    const body = await request.json();
    const { category, amount, description, date } = body;

    if (!category || !amount) {
      return new NextResponse("Category and amount are required", { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        tripId: id,
        category,
        amount: parseFloat(amount),
        description: description || null,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("[EXPENSE_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const expenses = await prisma.expense.findMany({
      where: { tripId: id },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("[EXPENSE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
