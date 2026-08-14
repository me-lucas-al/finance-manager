import { describe, it, expect } from "vitest";
import { Income } from "@/modules/finance/domain/Income";
import { Expense } from "@/modules/finance/domain/Expense";
import { Investment } from "@/modules/finance/domain/Investment";
import { DistributionRule } from "@/modules/finance/domain/DistributionRule";
import { UserConfig } from "@/modules/finance/domain/UserConfig";

describe("Domain Entities", () => {
  describe("Income", () => {
    it("should create an Income instance", () => {
      const income = new Income("1", "Salary", 5000, new Date("2024-01-01"));
      expect(income.id).toBe("1");
      expect(income.source).toBe("Salary");
      expect(income.amount).toBe(5000);
    });

    it("should throw error if amount is negative", () => {
      expect(() => new Income("1", "Salary", -10, new Date())).toThrow("Income amount cannot be negative");
    });
  });

  describe("Expense", () => {
    it("should create an Expense instance", () => {
      const expense = new Expense("1", "Food", 50, new Date());
      expect(expense.amount).toBe(50);
    });

    it("should throw error if amount is negative", () => {
      expect(() => new Expense("1", "Food", -10, new Date())).toThrow("Expense amount cannot be negative");
    });
  });

  describe("Investment", () => {
    it("should create an Investment instance", () => {
      const investment = new Investment("1", "Stocks", 100, new Date());
      expect(investment.amount).toBe(100);
    });

    it("should throw error if amount is negative", () => {
      expect(() => new Investment("1", "Stocks", -10, new Date())).toThrow("Investment amount cannot be negative");
    });
  });

  describe("DistributionRule", () => {
    it("should create a DistributionRule and evaluate percentages", () => {
      const rule = new DistributionRule(80, 20);
      expect(rule.isExpenseWarning(85)).toBe(true);
      expect(rule.isExpenseWarning(75)).toBe(false);

      expect(rule.isInvestmentWarning(15)).toBe(true);
      expect(rule.isInvestmentWarning(25)).toBe(false);
    });

    it("should throw if percentages are invalid", () => {
      expect(() => new DistributionRule(-10, 20)).toThrow("Max expense percentage must be between 0 and 100");
      expect(() => new DistributionRule(110, 20)).toThrow("Max expense percentage must be between 0 and 100");
      expect(() => new DistributionRule(80, -10)).toThrow("Min investment percentage must be between 0 and 100");
      expect(() => new DistributionRule(80, 110)).toThrow("Min investment percentage must be between 0 and 100");
    });
  });

  describe("UserConfig", () => {
    it("should create a UserConfig", () => {
      const config = new UserConfig(new DistributionRule(80, 20));
      expect(config.distributionRule.maxExpensePercentage).toBe(80);
    });
  });
});
