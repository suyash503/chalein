import { createTrip } from "./actions";

export default function Home() {
  return (
    <main className="mx-auto max-w-lg px-5 pb-20 pt-10 sm:pt-16">
      <header className="mb-9">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-coral-wash px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-coral-dark">
          No app to install
        </div>
        <h1 className="text-[2.1rem] font-extrabold leading-[1.1] tracking-[-0.02em] text-balance sm:text-[2.6rem]">
          Stop asking the group
          <br />
          &ldquo;so are we going or not?&rdquo;
        </h1>
        <p className="mt-4 text-[1.05rem] leading-relaxed text-muted">
          One link that always shows who&rsquo;s actually in, what it costs each
          person, and who has paid. Drop it in the group chat &mdash; your friends
          just tap it.
        </p>
      </header>

      <form
        action={createTrip}
        className="rounded-2xl border border-line bg-card p-5 shadow-[0_1px_2px_rgba(21,24,31,0.04),0_12px_28px_-16px_rgba(21,24,31,0.18)] sm:p-6"
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="label" htmlFor="title">
              Trip
            </label>
            <input
              id="title"
              name="title"
              required
              maxLength={60}
              className="field"
              placeholder="Goa in December"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="label" htmlFor="destination">
              Where
            </label>
            <input
              id="destination"
              name="destination"
              maxLength={60}
              className="field"
              placeholder="Anjuna, Goa"
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="startDate">
                From
              </label>
              <input id="startDate" name="startDate" type="date" className="field" />
            </div>
            <div>
              <label className="label" htmlFor="endDate">
                To
              </label>
              <input id="endDate" name="endDate" type="date" className="field" />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="estimatedTotal">
              Rough cost for the whole trip
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                &#8377;
              </span>
              <input
                id="estimatedTotal"
                name="estimatedTotal"
                inputMode="numeric"
                className="field pl-8"
                placeholder="60000"
                autoComplete="off"
              />
            </div>
            <p className="mt-1.5 text-[0.8rem] leading-snug text-muted">
              Everyone sees this split by however many are confirmed. It goes down
              as more people join &mdash; which is the bit that gets them to join.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="advanceAmount">
                Advance each
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                  &#8377;
                </span>
                <input
                  id="advanceAmount"
                  name="advanceAmount"
                  inputMode="numeric"
                  className="field pl-8"
                  placeholder="2000"
                  autoComplete="off"
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="decideBy">
                Decide by
              </label>
              <input id="decideBy" name="decideBy" type="date" className="field" />
            </div>
          </div>

          <div className="border-t border-line pt-4">
            <label className="label" htmlFor="organizerName">
              And you are
            </label>
            <input
              id="organizerName"
              name="organizerName"
              required
              maxLength={40}
              className="field"
              placeholder="Your name"
              autoComplete="given-name"
            />
          </div>

          <button
            type="submit"
            className="mt-1 w-full rounded-xl bg-coral px-5 py-3.5 text-[1.02rem] font-bold text-white transition-colors hover:bg-coral-dark active:bg-coral-dark"
          >
            Make the link
          </button>
        </div>
      </form>

      <ol className="mt-9 flex flex-col gap-3.5 text-[0.92rem] text-muted">
        <li className="flex gap-3">
          <span className="font-bold text-ink">1</span>
          <span>You get a link. Paste it in the group.</span>
        </li>
        <li className="flex gap-3">
          <span className="font-bold text-ink">2</span>
          <span>
            Everyone taps in, maybe, or out. No sign-up, no download, nothing.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="font-bold text-ink">3</span>
          <span>
            The link always shows the current answer, so nobody scrolls back
            through 400 messages to find it.
          </span>
        </li>
      </ol>
    </main>
  );
}
