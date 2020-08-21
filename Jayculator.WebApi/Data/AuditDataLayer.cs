using Dapper;
using Jayculator.Webapi.Model;
using Microsoft.Extensions.Configuration;
using System.Data.SQLite;
using System.IO;

namespace Jayculator.Webapi.Data
{
    public class AuditDataLayer
    {
        private readonly IConfiguration configuration;
        private readonly string auditFileName;
        private readonly string connectionStringFormat = @"Data Source={0};Version=3;";
        private readonly string connectionString = "";
        public AuditDataLayer(IConfiguration configuration)
        {
            this.configuration = configuration;
            auditFileName = this.configuration["AuditLogSqliteFileName"];
            connectionString = string.Format(connectionStringFormat, auditFileName);
            if (!File.Exists(auditFileName))
            {
                SQLiteConnection.CreateFile(auditFileName);
                SetupAuditTrail();
            }
        }

        private void SetupAuditTrail(bool dropAndCreate = false)
        {
            using (var conn = new SQLiteConnection(connectionString))
            {
                conn.Open();
                using (var cmd = new SQLiteCommand(conn))
                {
                    if (dropAndCreate)
                    {
                        cmd.CommandText = "DROP TABLE IF EXISTS AUDIT_LOG";
                        cmd.ExecuteNonQuery();
                    }

                    cmd.CommandText = @"CREATE TABLE [AUDIT_LOG] (
                                        [ID]	INTEGER NOT NULL UNIQUE,
                                        [FROM]	TEXT,
                                        [WHEN]	TEXT,
                                        PRIMARY KEY([ID] AUTOINCREMENT)
                                    );";
                    cmd.ExecuteNonQuery();
                }
            }
        }

        public void Log(LogEntry entry)
        {
            using (var conn = new SQLiteConnection(connectionString))
            {
                conn.Open();

                conn.Query<LogEntry>(@"INSERT INTO AUDIT_LOG ([FROM], [WHEN]) 
                VALUES(@from, @when)", entry);
            }
        }
    }
}
