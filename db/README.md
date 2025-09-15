# Database Setup

This document provides instructions on how to set up the MySQL database for the Jan Suvida application.

## Prerequisites

- A running MySQL server instance.
- A MySQL client (like the `mysql` command-line tool or a GUI like MySQL Workbench).

## Steps

1.  **Create the Database Schema**

    The `schema.sql` script defines all the tables, columns, and relationships. Run it from the project's root directory:

    ```bash
    mysql -u your_username -p < backend/db/schema.sql
    ```

    Enter your password when prompted. This will create the `jan_suvida` database and all its tables.

2.  **Seed the Database with Sample Data**

    The `seed.sql` script populates the tables with initial data for development. Run it from the project's root directory:

    ```bash
    mysql -u your_username -p jan_suvida < backend/db/seed.sql
    ```

    This command targets the `jan_suvida` database specifically and inserts the sample records.

## Backups and Rollbacks

For this prototype, backups can be performed manually using `mysqldump`:

```bash
mysqldump -u your_username -p jan_suvida > backup_$(date +%F).sql