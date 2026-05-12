<script lang="ts">
    import { enhance } from "$app/forms";
    import {
        ChevronRight,
        ChevronDown,
        LogOut,
        RefreshCw,
        Plus,
    } from "lucide-svelte";

    let { data } = $props();

    type Role = "admin" | "teacher" | "student" | "company";

    type Persona = {
        id: string;
        email: string;
        role: Role;
        full_name: string;
        subtitle: string;
    };

    const PERSONAS: Persona[] = [
        // == Admin ===============
        {
            id: "seed-admin-001",
            email: "pfe@esst-sup.com",
            role: "admin",
            full_name: "Administrateur PFE",
            subtitle: "Acces complet au systeme",
        },

        // == Teachers — ISIL =====
        {
            id: "seed-teacher-isil-001",
            email: "prof.isil1@esst-sup.com",
            role: "teacher",
            full_name: "Prof. ISIL 1",
            subtitle: "Professeur ISIL — disponible",
        },
        {
            id: "seed-teacher-isil-002",
            email: "prof.isil2@esst-sup.com",
            role: "teacher",
            full_name: "Prof. ISIL 2",
            subtitle: "MCA ISIL — indisponible",
        },
        {
            id: "seed-teacher-isil-003",
            email: "prof.isil3@esst-sup.com",
            role: "teacher",
            full_name: "Prof. ISIL 3",
            subtitle: "MCB ISIL — indisponible jusqu'au 01/08/2026",
        },

        // == Teachers — CHIM =====
        {
            id: "seed-teacher-chim-001",
            email: "prof.chim1@esst-sup.com",
            role: "teacher",
            full_name: "Prof. CHIM 1",
            subtitle: "MCA CHIM — disponible",
        },
        {
            id: "seed-teacher-chim-002",
            email: "prof.chim2@esst-sup.com",
            role: "teacher",
            full_name: "Prof. CHIM 2",
            subtitle: "MAA CHIM — disponible",
        },
        {
            id: "seed-teacher-chim-003",
            email: "prof.chim3@esst-sup.com",
            role: "teacher",
            full_name: "Prof. CHIM 3",
            subtitle: "MAB CHIM — disponible",
        },

        // == Teachers — ELEC =====
        {
            id: "seed-teacher-elec-001",
            email: "prof.elec1@esst-sup.com",
            role: "teacher",
            full_name: "Prof. ELEC 1",
            subtitle: "Professeur ELEC — disponible",
        },
        {
            id: "seed-teacher-elec-002",
            email: "prof.elec2@esst-sup.com",
            role: "teacher",
            full_name: "Prof. ELEC 2",
            subtitle: "Assistant ELEC — disponible",
        },
        {
            id: "seed-teacher-elec-003",
            email: "prof.elec3@esst-sup.com",
            role: "teacher",
            full_name: "Prof. ELEC 3",
            subtitle: "MCB ELEC — disponible",
        },

        // == Students ============
        {
            id: "seed-student-isil-001",
            email: "etudiant.isil1@esst-sup.com",
            role: "student",
            full_name: "Etudiant ISIL 1",
            subtitle: "ISIL — Ingenieur",
        },
        {
            id: "seed-student-isil-002",
            email: "etudiant.isil2@esst-sup.com",
            role: "student",
            full_name: "Etudiant ISIL 2",
            subtitle: "ISIL — Ingenieur",
        },
        {
            id: "seed-student-isil-003",
            email: "etudiant.isil3@esst-sup.com",
            role: "student",
            full_name: "Etudiant ISIL 3",
            subtitle: "ISIL — Ingenieur",
        },
        {
            id: "seed-student-chim-001",
            email: "etudiant.chim1@esst-sup.com",
            role: "student",
            full_name: "Etudiant CHIM 1",
            subtitle: "CHIM — Master",
        },
        {
            id: "seed-student-chim-002",
            email: "etudiant.chim2@esst-sup.com",
            role: "student",
            full_name: "Etudiant CHIM 2",
            subtitle: "CHIM — Master",
        },

        // == Company =============
        {
            id: "seed-company-techcorp",
            email: "contact@techcorp-dz.com",
            role: "company",
            full_name: "TechCorp Algeria",
            subtitle: "Entreprise validee — secteur Technology",
        },
    ];

    let showCustom = $state(false);
    let cRole = $state<Role>("student");
    let cName = $state("");
    let cEmail = $state("");
    let cId = $state(`dev-custom-${Math.random().toString(36).slice(2, 8)}`);
    let loadingId = $state<string | null>(null);

    function newId() {
        cId = `dev-custom-${Math.random().toString(36).slice(2, 8)}`;
    }
</script>

<svelte:head>
    <title>Dev Auth — PFE Manager</title>
</svelte:head>

<div class="page">
    <div class="env-strip">
        Development environment — not accessible in production
    </div>

    <div class="container">
        <header class="header">
            <div>
                <p class="header-tag">DEV AUTH</p>
                <h1 class="header-title">Select an account</h1>
                <p class="header-sub">
                    Profiles are provisioned in SQLite on first sign-in. No
                    Google account or Supabase session required.
                </p>
            </div>

            {#if data.current}
                <div class="session-card">
                    <div class="session-info">
                        <span class="session-name"
                            >{data.current.full_name}</span
                        >
                        <span class="session-meta">
                            <span
                                class="role-label"
                                data-role={data.current.role}
                                >{data.current.role}</span
                            >
                            {data.current.email}
                        </span>
                    </div>
                    <form method="POST" action="?/logout" use:enhance>
                        <button class="btn-signout" type="submit">
                            <LogOut size={13} strokeWidth={2} />
                            Sign out
                        </button>
                    </form>
                </div>
            {/if}
        </header>

        <section class="persona-list">
            {#each PERSONAS as persona (persona.id)}
                {@const isActive = data.current?.id === persona.id}
                {@const isLoading = loadingId === persona.id}

                <form
                    method="POST"
                    action="?/login"
                    use:enhance={() => {
                        loadingId = persona.id;
                        return async ({ update }) => {
                            await update();
                            loadingId = null;
                        };
                    }}
                >
                    <input type="hidden" name="id" value={persona.id} />
                    <input type="hidden" name="email" value={persona.email} />
                    <input type="hidden" name="role" value={persona.role} />
                    <input
                        type="hidden"
                        name="full_name"
                        value={persona.full_name}
                    />

                    <button
                        type="submit"
                        class="persona-row"
                        class:active={isActive}
                        class:loading={isLoading}
                        data-role={persona.role}
                        disabled={isLoading}
                    >
                        <span class="role-bar"></span>

                        <span class="persona-main">
                            <span class="persona-name">{persona.full_name}</span
                            >
                            <span class="persona-sub">{persona.subtitle}</span>
                        </span>

                        <span class="persona-email">{persona.email}</span>

                        <span class="persona-status">
                            {#if isActive}
                                <span class="status-active">signed in</span>
                            {:else if isLoading}
                                <span class="status-loading">signing in</span>
                            {:else}
                                <span class="status-arrow">
                                    <ChevronRight size={15} strokeWidth={2} />
                                </span>
                            {/if}
                        </span>
                    </button>
                </form>
            {/each}
        </section>

        <section class="custom-section">
            <button
                type="button"
                class="custom-toggle"
                class:open={showCustom}
                onclick={() => (showCustom = !showCustom)}
            >
                <Plus size={13} strokeWidth={2.5} />
                Custom account
                <span class="toggle-chevron" class:rotated={showCustom}>
                    <ChevronDown size={13} strokeWidth={2} />
                </span>
            </button>

            {#if showCustom}
                <form
                    method="POST"
                    action="?/login"
                    class="custom-form"
                    use:enhance={() => {
                        loadingId = cId;
                        return async ({ update }) => {
                            await update();
                            loadingId = null;
                        };
                    }}
                >
                    <div class="custom-grid">
                        <div class="field">
                            <label for="c-name">Full name</label>
                            <input
                                id="c-name"
                                name="full_name"
                                type="text"
                                placeholder="Name Surname"
                                bind:value={cName}
                                required
                            />
                        </div>

                        <div class="field">
                            <label for="c-role">Role</label>
                            <select id="c-role" name="role" bind:value={cRole}>
                                <option value="admin">Admin</option>
                                <option value="teacher">Teacher</option>
                                <option value="student">Student</option>
                                <option value="company">Company</option>
                            </select>
                        </div>

                        <div class="field">
                            <label for="c-email">Email</label>
                            <input
                                id="c-email"
                                name="email"
                                type="email"
                                placeholder="user@dev.local"
                                bind:value={cEmail}
                                required
                            />
                        </div>

                        <div class="field">
                            <label for="c-id">
                                Identifier
                                <span class="label-hint"
                                    >stable across logins</span
                                >
                            </label>
                            <span class="id-row">
                                <input
                                    id="c-id"
                                    name="id"
                                    type="text"
                                    class="mono"
                                    bind:value={cId}
                                    required
                                />
                                <button
                                    type="button"
                                    class="btn-refresh"
                                    onclick={newId}
                                    title="Regenerate"
                                >
                                    <RefreshCw size={12} strokeWidth={2} />
                                </button>
                            </span>
                        </div>
                    </div>

                    <div class="custom-actions">
                        <button
                            type="submit"
                            class="btn-primary"
                            disabled={loadingId === cId}
                        >
                            {loadingId === cId ? "Signing in..." : "Sign in"}
                        </button>
                    </div>
                </form>
            {/if}
        </section>

        <footer class="footer">
            Cookie signed with HMAC-SHA256
            <span class="dot"></span>
            7-day session
            <span class="dot"></span>
            Set <code>DATABASE_ADAPTER=supabase</code> to disable
        </footer>
    </div>
</div>

<style>
    /* == Role color tokens ===== */
    [data-role="admin"] {
        --role: #b91c1c;
    }
    [data-role="teacher"] {
        --role: #1d4ed8;
    }
    [data-role="student"] {
        --role: #15803d;
    }
    [data-role="company"] {
        --role: #6d28d9;
    }

    /* == Page shell ============ */
    .page {
        min-height: 100vh;
        background: var(--color-background);
        display: flex;
        flex-direction: column;
    }

    .env-strip {
        background: #fefce8;
        border-bottom: 1px solid #fde047;
        color: #713f12;
        font-size: 0.7rem;
        font-family: var(--font-sans);
        font-weight: 500;
        letter-spacing: 0.04em;
        text-align: center;
        padding: 0.4rem 1rem;
        text-transform: uppercase;
    }

    .container {
        max-width: 640px;
        width: 100%;
        margin: 0 auto;
        padding: 3rem 1.5rem 5rem;
    }

    /* == Header ================ */
    .header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 2rem;
        margin-bottom: 2.5rem;
        flex-wrap: wrap;
    }

    .header-tag {
        font-family: monospace;
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--color-text-muted);
        border: 1px solid var(--color-border);
        border-radius: 3px;
        padding: 0.15rem 0.45rem;
        display: inline-block;
        margin: 0 0 0.65rem;
    }

    .header-title {
        font-family: var(--font-sans);
        font-size: 1.75rem;
        font-weight: 700;
        letter-spacing: -0.025em;
        color: var(--color-text);
        margin: 0 0 0.4rem;
        line-height: 1.15;
    }

    .header-sub {
        font-family: var(--font-sans);
        font-size: 0.85rem;
        color: var(--color-text-muted);
        margin: 0;
        line-height: 1.5;
        max-width: 38ch;
    }

    /* Current session card */
    .session-card {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.65rem 0.85rem;
        background: var(--color-background-100);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        flex-shrink: 0;
    }

    .session-info {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
    }

    .session-name {
        font-family: var(--font-sans);
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--color-text);
        white-space: nowrap;
    }

    .session-meta {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.72rem;
        color: var(--color-text-muted);
        font-family: monospace;
    }

    .role-label {
        font-size: 0.6rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--role);
    }

    .btn-signout {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.3rem 0.6rem;
        border: 1px solid var(--color-border);
        border-radius: 5px;
        background: none;
        color: var(--color-text-muted);
        font-family: var(--font-sans);
        font-size: 0.75rem;
        cursor: pointer;
        white-space: nowrap;
        transition:
            border-color var(--transition-fast),
            color var(--transition-fast);
    }

    .btn-signout:hover {
        border-color: var(--color-danger);
        color: var(--color-danger);
    }

    /* == Persona list =========== */
    .persona-list {
        border: 1px solid var(--color-border);
        border-radius: 10px;
        overflow: hidden;
        margin-bottom: 0.875rem;
    }

    .persona-list form + form .persona-row {
        border-top: 1px solid var(--color-border);
    }

    .persona-row {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.85rem 1rem;
        background: var(--color-background);
        border: none;
        cursor: pointer;
        text-align: left;
        transition: background var(--transition-fast);
    }

    .persona-row:hover {
        background: var(--color-background-100);
    }

    .persona-row.active {
        background: color-mix(in srgb, var(--role) 5%, var(--color-background));
    }

    .persona-row.loading {
        opacity: 0.55;
        cursor: wait;
    }

    /* Colored left bar */
    .role-bar {
        display: block;
        width: 3px;
        height: 1.75rem;
        border-radius: 2px;
        background: var(--role);
        flex-shrink: 0;
    }

    /* Name + subtitle */
    .persona-main {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.1rem;
    }

    .persona-name {
        font-family: var(--font-sans);
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .persona-sub {
        font-family: var(--font-sans);
        font-size: 0.72rem;
        color: var(--color-text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .persona-email {
        font-family: monospace;
        font-size: 0.72rem;
        color: var(--color-text-muted);
        white-space: nowrap;
    }

    /* Status area */
    .persona-status {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        width: 5.5rem;
        justify-content: flex-end;
    }

    .status-active {
        font-family: monospace;
        font-size: 0.62rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--role);
    }

    .status-loading {
        font-family: monospace;
        font-size: 0.62rem;
        color: var(--color-text-muted);
    }

    .status-arrow {
        display: flex;
        align-items: center;
        color: var(--color-text-muted);
        opacity: 0;
        transition: opacity var(--transition-fast);
    }

    .persona-row:hover .status-arrow {
        opacity: 1;
    }

    /* == Custom persona ========= */
    .custom-section {
        border: 1px solid var(--color-border);
        border-radius: 10px;
        overflow: hidden;
        margin-bottom: 2.5rem;
    }

    .custom-toggle {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.8rem 1rem;
        background: none;
        border: none;
        cursor: pointer;
        font-family: var(--font-sans);
        font-size: 0.82rem;
        font-weight: 500;
        color: var(--color-text-muted);
        text-align: left;
        transition:
            background var(--transition-fast),
            color var(--transition-fast);
    }

    .custom-toggle:hover,
    .custom-toggle.open {
        background: var(--color-background-100);
        color: var(--color-text);
    }

    .toggle-chevron {
        margin-left: auto;
        display: flex;
        align-items: center;
        transition: transform var(--transition-fast);
    }

    .toggle-chevron.rotated {
        transform: rotate(180deg);
    }

    .custom-form {
        border-top: 1px solid var(--color-border);
        padding: 1.25rem 1rem;
        background: var(--color-background-100);
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .custom-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
    }

    .field label {
        font-family: var(--font-sans);
        font-size: 0.72rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-text-muted);
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .label-hint {
        font-weight: 400;
        text-transform: none;
        letter-spacing: 0;
        color: var(--color-text-disabled);
    }

    .field input,
    .field select {
        height: 2rem;
        padding: 0 0.6rem;
        border: 1px solid var(--color-border);
        border-radius: 5px;
        background: var(--color-background);
        color: var(--color-text);
        font-family: var(--font-sans);
        font-size: 0.82rem;
        outline: none;
        width: 100%;
        transition: border-color var(--transition-fast);
    }

    .field input.mono {
        font-family: monospace;
        font-size: 0.75rem;
    }

    .field input:focus,
    .field select:focus {
        border-color: var(--color-accent);
    }

    .id-row {
        display: flex;
        gap: 0.4rem;
    }

    .id-row input {
        flex: 1;
        min-width: 0;
    }

    .btn-refresh {
        height: 2rem;
        width: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        border: 1px solid var(--color-border);
        border-radius: 5px;
        background: var(--color-background);
        color: var(--color-text-muted);
        cursor: pointer;
        transition:
            border-color var(--transition-fast),
            color var(--transition-fast);
    }

    .btn-refresh:hover {
        border-color: var(--color-border-strong);
        color: var(--color-text);
    }

    .custom-actions {
        display: flex;
        align-items: center;
    }

    .btn-primary {
        height: 2rem;
        padding: 0 1.25rem;
        background: var(--color-accent);
        color: #fff;
        border: none;
        border-radius: 5px;
        font-family: var(--font-sans);
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: background var(--transition-fast);
    }

    .btn-primary:hover:not(:disabled) {
        background: var(--color-accent-hover);
    }

    .btn-primary:disabled {
        opacity: 0.5;
        cursor: wait;
    }

    /* == Footer ================ */
    .footer {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        flex-wrap: wrap;
        font-family: monospace;
        font-size: 0.7rem;
        color: var(--color-text-disabled);
    }

    .dot {
        display: inline-block;
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: var(--color-border-strong);
        flex-shrink: 0;
    }

    code {
        font-family: monospace;
    }

    /* == Responsive ============ */
    @media (max-width: 520px) {
        .header {
            flex-direction: column;
        }

        .session-card {
            width: 100%;
        }

        .persona-email {
            display: none;
        }

        .persona-status {
            width: auto;
        }

        .custom-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
