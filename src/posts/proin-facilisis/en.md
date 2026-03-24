---
lang: en
title: "Proin Facilisis: Making Things Easier"
description: "On the philosophy of reducing friction—in code, in design, and in everyday life."
---

_Proin facilisis_—Latin for "promoting ease." It appears in old botanical texts
to describe a plant that aids digestion, smooths a passage, clears an
obstruction. As a philosophy for building software, it translates remarkably
well.

Good software reduces friction. It anticipates the user’s next step. It provides
the right affordance at the right moment. It gets out of the way.

## The friction inventory

Proin in tellus sit amet nibh dignissim sagittis. The first step in reducing
friction is to map it. Where does the user slow down? Where does attention
spike? Where do errors cluster?

In a typical web application, the highest-friction moments are predictable:
onboarding, form submission, error recovery, and loading states. These are the
vestibules of the product—the thresholds users must cross to reach the value
inside.

```ts
// Friction shows up in code too.
// Compare these two approaches to handling a missing value:

// High friction—the caller must always check:
function getUser(id: string): User | undefined {/* … */}

// Lower friction—the error is explicit and handled at the boundary:
function getUser(id: string): User {
  const user = db.find(id);
  if (user === undefined) {
    throw new Error(`User not found: ${id}`);
  }
  return user;
}
```

## The paradox of ease

Vivamus pretium aliquet erat. There is a paradox at the heart of "making things
easy": it is very hard to do. Eliminating friction requires deep understanding
of the user, the context, and the failure modes. It demands more work from the
builder so that less work falls on the user.

This is why ease is a form of generosity. Every unnecessary step you remove from
your user’s path is time returned to them—time they can spend on the thing that
actually matters.

## Facilisis in practice

Donec aliquet metus ut erat semper, et tincidunt nulla luctus. Some principles I
return to:

- Defaults should be correct for most users, most of the time.
- Error messages should explain what went wrong and how to fix it.
- The happy path should require no thought.
- Configuration should be possible, never required.
- Documentation is part of the product.

Nulla facilisi. Phasellus blandit leo ut odio. Nam sed nulla non diam tincidunt
tempus. The name of this principle—_nulla facilisi_, "no easy thing"—is a
reminder that ease, properly understood, is never accidental.
