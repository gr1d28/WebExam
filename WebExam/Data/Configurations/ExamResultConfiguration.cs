using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebExam.Models;

namespace WebExam.Data.Configurations
{
    public class ExamResultConfiguration : IEntityTypeConfiguration<ExamResult>
    {
        public void Configure(EntityTypeBuilder<ExamResult> builder)
        {
            builder.ToTable("ExamResults");

            builder.HasKey(er => er.Id);

            builder.Property(er => er.TotalScore)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(er => er.MaxPossibleScore)
                .IsRequired();

            builder.Property(er => er.Percentage)
                .IsRequired()
                .HasColumnType("decimal(5,2)");

            builder.Property(er => er.IsPassed)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(er => er.CalculatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            builder.Property(er => er.Feedback)
                .HasMaxLength(2000)
                .IsRequired(false);

            // Индексы
            builder.HasIndex(er => er.ExamSessionId)
                .IsUnique();

            // Связи
            builder.HasOne(er => er.ExamSession)
                .WithOne(es => es.ExamResult)
                .HasForeignKey<ExamResult>(er => er.ExamSessionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
