<script lang="ts">
    import Card from "./Card.svelte";
    import DatePicker from "./DatePicker.svelte";
    import SelectField from "./SelectField.svelte";
    import Total from "./Total.svelte";
    import Modal from "./Modal.svelte";
    import { createEventDispatcher } from "svelte";

    export let days: number = 0;
    export let pricePerDay: number = 120;
    export let bookingFee: number = 12.5;
    export let shadow: boolean = true;

    export let fromDate: Date = null;
    export let toDate: Date = null;

    const dispatch = createEventDispatcher();
    let form;
    let showModal = false;
    let message = "";
    let email = "";
    let phone = "";
    let guests;

    $: days = calculateDays(fromDate, toDate);
    $: formValid = days > 0 && (email != "" || phone != "");

    function calculateDays(fromDate: Date, toDate: Date) {
        if (fromDate == null || toDate == null) return 0;
        if (fromDate == undefined || toDate == undefined) return 0;
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return 0;

        const milliseconds = toDate.getTime() - fromDate.getTime();
        const days = Math.abs(milliseconds) / (1000 * 60 * 60 * 24);
        return Math.floor(days);
    }

    function reserveClicked() {
        form.submit();
    }
</script>

<div class="container">
    <Card {shadow}>
        <div class="content">
            <h3>Choose your stay</h3>
            <DatePicker
                title="From"
                date={fromDate}
                on:datePickerChanged={(event) => (fromDate = event.detail)}
            />
            <DatePicker
                title="To"
                date={toDate}
                on:datePickerChanged={(event) => (toDate = event.detail)}
            />

            {#if days > 0}
                <div class="total">
                    <Total {days} {pricePerDay} {bookingFee} />
                </div>
            {/if}

            <div class="mt-2">
                <button
                    on:click={() => (showModal = true)}
                    class="reserve-btn"
                >
                    Reserve
                </button>
            </div>
            <p class="pt-3">You won't be charged yet</p>
        </div>
    </Card>
</div>

{#if showModal}
    <Modal onClose={() => (showModal = false)}>
        <div class="form">
            <h3 class="form-title">Show your interest</h3>
            <DatePicker
                title="From"
                date={fromDate}
                on:datePickerChanged={(event) => (fromDate = event.detail)}
            />
            <DatePicker
                title="To"
                date={toDate}
                on:datePickerChanged={(event) => (toDate = event.detail)}
            />

            <SelectField label="Guests" items={["1", "2", "3", "4"]} />

            <div class="text-field">
                <textarea
                    bind:value={message}
                    class="textarea"
                    placeholder="Message (optional)"
                />
            </div>

            <div class="mb-1">
                <input
                    type="email"
                    bind:value={email}
                    class="input"
                    placeholder="Email"
                />
            </div>

            <div class="mb-1">
                <input
                    type="text"
                    bind:value={phone}
                    class="input"
                    placeholder="Phone"
                />
            </div>

            {#if days > 0}
                <div class="total">
                    <Total {days} {pricePerDay} {bookingFee} />
                </div>
            {/if}

            <div class:disabled={!formValid}>
                <button
                    on:click={() => reserveClicked()}
                    disabled={!formValid}
                    class="reserve-btn"
                >
                    Reserve
                </button>
            </div>
        </div>
    </Modal>
{/if}

<div class="hidden">
    <form
        bind:this={form}
        action="https://formsubmit.co/d44fefa7c974ee3bc959adbde1c49b0d"
        method="POST"
    >
        <input value={fromDate} type="text" name="Start Date" />
        <input value={toDate} type="text" name="End Date" />
        <input value={guests} type="text" name="Guests" />
        <input value={message} type="text" name="Message" />
        <input value={email} type="text" name="Email" />
        <input value={phone} type="text" name="Phone" />
    </form>
</div>

<style>
    :root {
        --primary: rgb(1, 135, 134);
    }

    .container {
        display: flex;
    }

    .content {
        padding: 5% 0;
    }

    .total {
        margin: 5% 0;
    }

    .form {
        justify-content: center;
        color: #213547;
    }

    .form-title {
        color: #213547;
        margin-top: 0;
        margin-bottom: 1rem;
    }

    .text-field {
        width: 100%;
        margin-bottom: 1rem;
    }

    .mt-2 {
        margin-top: 2rem;
    }

    .mb-1 {
        margin-bottom: 1rem;
    }

    .p-0 {
        padding: 0;
    }

    .hidden {
        display: none;
    }

    .disabled {
        opacity: 0.5;
        pointer-events: none;
    }

    .input,
    .textarea {
        width: 100%;
        border-radius: 0.375rem;
        border-width: 1px;
        border-color: #d1d5db;
        padding: 0.5rem 0.75rem;
    }

    .input:focus,
    .textarea:focus {
        outline: none;
        border-color: #2563eb;
    }

    .textarea {
        resize: none;
        height: 4rem;
    }

    .reserve-btn {
        border-radius: 9999px;
        background-color: var(--primary);
        border-color: white;
        padding: 0.75rem 1.5rem;
        font-weight: 500;
        color: #ffffff;
    }

    .reserve-btn:hover:not(:disabled) {
        background-color: rgb(1, 170, 168);
    }

    .reserve-btn:disabled {
        background-color: #60a5fa;
        cursor: not-allowed;
    }

    @media (prefers-color-scheme: dark) {
        .content {
            background-color: #222;
        }

        .form {
            color: white;
        }

        .form-title {
            color: white;
        }

        .input,
        .textarea {
            border-color: #4b5563;
            background-color: #374151;
            color: #f9fafb;
        }
    }

    @media (max-width: 800px) {
        .container {
            justify-content: center;
            margin-bottom: 2rem;
            color: #213547;
        }

        .content {
            width: 70vw;
        }
    }
</style>
