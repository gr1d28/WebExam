using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebExam.Models;

namespace WebExam.Data.Configurations
{
    public class UserAnswerConfiguration : IEntityTypeConfiguration<UserAnswer>
    {
        public void Configure(EntityTypeBuilder<UserAnswer> builder)
        {
            builder.ToTable("UserAnswers");

            builder.HasKey(ua => ua.Id);

            builder.Property(ua => ua.AnswerText)
                .HasMaxLength(4000)
                .IsRequired(false);

            builder.Property(ua => ua.AnsweredAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            // Уникальный индекс: одна попытка ответа на вопрос в сессии
            builder.HasIndex(ua => new { ua.ExamSessionId, ua.QuestionId })
                .IsUnique();

            // Индексы
            builder.HasIndex(ua => ua.ExamSessionId);
            builder.HasIndex(ua => ua.QuestionId);

            // Связи
            builder.HasOne(ua => ua.ExamSession)
                .WithMany(es => es.UserAnswers)
                .HasForeignKey(ua => ua.ExamSessionId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ua => ua.Question)
                .WithMany()
                .HasForeignKey(ua => ua.QuestionId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(ua => ua.SelectedOptions)
                .WithOne(sao => sao.UserAnswer)
                .HasForeignKey(sao => sao.UserAnswerId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
