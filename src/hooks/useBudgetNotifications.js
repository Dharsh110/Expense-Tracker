import { useEffect, useRef } from "react";

import {
  addUserDocument,
  updateUserDocument,
  getUserProfile,
} from "../services/firestoreData";

import { calculateSpent } from "../utils/budgetUtils";

const THRESHOLDS = [
  { key: "1000", limit: 1000 },
  { key: "500", limit: 500 },
  { key: "0", limit: 0 },
];

function buildMessage(budget, key, remaining) {
  if (key === "exceeded") {
    return `Your ${budget.category} budget is exceeded! You've gone ₹${Math.abs(
      remaining
    )} over the ₹${budget.amount} limit.`;
  }

  if (key === "0") {
    return `Your ${budget.category} budget is fully used — ₹0 remaining out of ₹${budget.amount}.`;
  }

  return `Your ${budget.category} budget has ₹${remaining} remaining out of ₹${budget.amount} (down to the ₹${key} mark).`;
}

async function notificationsEnabled() {
  try {
    const profile = await getUserProfile();
    return !profile || profile.notificationsEnabled !== false;
  } catch (error) {
    return true;
  }
}

function useBudgetNotifications(budgets, transactions) {
  const processedRef = useRef(new Set());

  useEffect(() => {
    if (!budgets || budgets.length === 0) return;

    (async () => {

    if (!(await notificationsEnabled())) return;

    budgets.forEach(async (budget) => {
      const spent = calculateSpent(
        transactions,
        budget.category,
        budget.type
      );

      const remaining = Number(budget.amount) - spent;

      const alreadyNotified = budget.notifiedThresholds || [];
      const toNotify = [];

      THRESHOLDS.forEach((t) => {
        if (
          remaining <= t.limit &&
          !alreadyNotified.includes(t.key)
        ) {
          toNotify.push(t.key);
        }
      });

      if (remaining < 0 && !alreadyNotified.includes("exceeded")) {
        toNotify.push("exceeded");
      }

      const isHealthyAgain =
        remaining > 1000 && alreadyNotified.length > 0;

      if (toNotify.length === 0 && !isHealthyAgain) return;

      const dedupeKey = `${budget.id}:${toNotify.join(",")}`;

      if (toNotify.length > 0) {
        if (processedRef.current.has(dedupeKey)) return;

        processedRef.current.add(dedupeKey);

        for (const key of toNotify) {
          await addUserDocument("notifications", {
            message: buildMessage(budget, key, remaining),
            type:
              key === "exceeded"
                ? "budget_exceeded"
                : `budget_${key}`,
            read: false,
            deleted: false,
          });
        }

        await updateUserDocument("budgets", budget.id, {
          notifiedThresholds: [...alreadyNotified, ...toNotify],
        });
      } else if (isHealthyAgain) {
        await updateUserDocument("budgets", budget.id, {
          notifiedThresholds: [],
        });
      }
    });

    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgets, transactions]);
}

export default useBudgetNotifications;
