using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebExam.Models;

namespace WebExam.Data.Configurations
{
    public class ExamSessionConfiguration : IEntityTypeConfiguration<ExamSession>
    {
        public void Configure(EntityTypeBuilder<ExamSession> builder)
        {
            builder.ToTable("ExamSessions");

            builder.HasKey(es => es.Id);

            // Для сессий используем Guid как первичный ключ
            builder.Property(es => es.Id)
                .ValueGeneratedOnAdd();

            builder.Property(es => es.StartTime)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            builder.Property(es => es.EndTime)
                .IsRequired(false);

            builder.Property(es => es.Status)
                .IsRequired()
                .HasConversion<int>()
                .HasDefaultValue(ExamSessionStatus.InProgress);

            builder.Property(es => es.CurrentQuestionIndex)
                .IsRequired()
                .HasDefaultValue(0);

            // Индексы для быстрого поиска
            builder.HasIndex(es => es.UserId);
            builder.HasIndex(es => es.ExamId);
            builder.HasIndex(es => es.Status);
            builder.HasIndex(es => new { es.UserId, es.ExamId, es.Status });

            // Связи
            builder.HasOne(es => es.User)
                .WithMany(u => u.ExamSessions)
                .HasForeignKey(es => es.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(es => es.Exam)
                .WithMany(e => e.ExamSessions)
                .HasForeignKey(es => es.ExamId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(es => es.UserAnswers)
                .WithOne(ua => ua.ExamSession)
                .HasForeignKey(ua => ua.ExamSessionId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(es => es.ExamResult)
                .WithOne(er => er.ExamSession)
                .HasForeignKey<ExamResult>(er => er.ExamSessionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
